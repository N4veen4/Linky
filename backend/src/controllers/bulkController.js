import multer from 'multer';
import Url from '../models/Url.js';
import Analytics from '../models/Analytics.js';
import { generateShortCode } from '../utils/generateShortCode.js';

// ── Multer: memory storage (no disk writes) ─────────────────────────────────
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1 * 1024 * 1024 }, // 1 MB max
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only .csv files are accepted'));
    }
  },
});

// ── Helpers ──────────────────────────────────────────────────────────────────

const isValidUrl = (urlStr) => {
  try {
    let str = urlStr;
    if (!str.startsWith('http://') && !str.startsWith('https://')) {
      str = 'https://' + str;
    }
    const u = new URL(str);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
};

const getHostname = (urlStr) => {
  try {
    let str = urlStr;
    if (!str.startsWith('http://') && !str.startsWith('https://')) {
      str = 'https://' + str;
    }
    return new URL(str).hostname.replace('www.', '');
  } catch {
    return 'Webpage';
  }
};

/**
 * Parse a raw CSV string into an array of row objects.
 * Expected header (case-insensitive): originalUrl, customAlias, expiresAt, isPublicStats
 * Returns: [{ originalUrl, customAlias, expiresAt, isPublicStats }]
 */
const parseCsv = (raw) => {
  const lines = raw
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 2) throw new Error('CSV must have a header row and at least one data row');

  // Parse header
  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());

  const urlIdx         = headers.indexOf('originalurl');
  const aliasIdx       = headers.indexOf('customalias');
  const expiresIdx     = headers.indexOf('expiresat');
  const publicIdx      = headers.indexOf('ispublicstats');

  if (urlIdx === -1) throw new Error('CSV must have an "originalUrl" column');

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    // Simple CSV split (handles empty fields, not quoted commas)
    const cols = lines[i].split(',').map((c) => c.trim());
    rows.push({
      originalUrl:   cols[urlIdx]     || '',
      customAlias:   aliasIdx !== -1  ? (cols[aliasIdx]   || '') : '',
      expiresAt:     expiresIdx !== -1 ? (cols[expiresIdx] || '') : '',
      isPublicStats: publicIdx !== -1  ? (cols[publicIdx]  || '').toLowerCase() === 'true' : false,
    });
  }
  return rows;
};

// ── Controller ───────────────────────────────────────────────────────────────

const MAX_BULK = 50;

// @desc    Bulk shorten URLs from CSV upload
// @route   POST /api/url/bulk
// @access  Private
export const bulkShortenUrls = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No CSV file uploaded' });
    }

    const raw = req.file.buffer.toString('utf-8');
    let rows;
    try {
      rows = parseCsv(raw);
    } catch (parseErr) {
      return res.status(400).json({ success: false, error: parseErr.message });
    }

    if (rows.length === 0) {
      return res.status(400).json({ success: false, error: 'CSV contains no data rows' });
    }

    if (rows.length > MAX_BULK) {
      return res.status(400).json({
        success: false,
        error: `Too many rows. Maximum is ${MAX_BULK} URLs per upload.`,
      });
    }

    const results = [];
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';

    for (let i = 0; i < rows.length; i++) {
      const { originalUrl, customAlias, expiresAt, isPublicStats } = rows[i];
      const rowNum = i + 2; // +2 because row 1 is header

      // ── Validate ──────────────────────────────────────────────────────────
      if (!originalUrl) {
        results.push({ row: rowNum, originalUrl: '', success: false, error: 'originalUrl is empty' });
        continue;
      }

      if (!isValidUrl(originalUrl)) {
        results.push({ row: rowNum, originalUrl, success: false, error: 'Invalid URL format' });
        continue;
      }

      if (originalUrl.length > 2048) {
        results.push({ row: rowNum, originalUrl, success: false, error: 'URL too long (max 2048 chars)' });
        continue;
      }

      // ── Alias handling ────────────────────────────────────────────────────
      let shortCode;

      if (customAlias) {
        const trimmedAlias = customAlias.trim();

        if (trimmedAlias.length > 50) {
          results.push({ row: rowNum, originalUrl, success: false, error: 'Alias too long (max 50 chars)' });
          continue;
        }

        const aliasRegex = /^[a-zA-Z0-9-_]+$/;
        if (!aliasRegex.test(trimmedAlias)) {
          results.push({ row: rowNum, originalUrl, success: false, error: 'Alias has invalid characters' });
          continue;
        }

        const aliasExists = await Url.findOne({
          $or: [{ shortCode: trimmedAlias }, { customAlias: trimmedAlias }],
        });

        if (aliasExists) {
          results.push({ row: rowNum, originalUrl, success: false, error: `Alias "${trimmedAlias}" already in use` });
          continue;
        }

        shortCode = trimmedAlias;
      } else {
        // Generate unique short code
        let unique = false;
        let attempts = 0;
        while (!unique && attempts < 10) {
          shortCode = generateShortCode();
          const exists = await Url.findOne({ $or: [{ shortCode }, { customAlias: shortCode }] });
          if (!exists) unique = true;
          attempts++;
        }
        if (!unique) {
          results.push({ row: rowNum, originalUrl, success: false, error: 'Could not generate unique code' });
          continue;
        }
      }

      // ── Create ────────────────────────────────────────────────────────────
      try {
        const newUrl = await Url.create({
          originalUrl,
          shortCode,
          customAlias: customAlias ? customAlias.trim() : undefined,
          title: getHostname(originalUrl),
          creator: req.user._id,
          expiresAt: expiresAt ? new Date(expiresAt) : undefined,
          isPublicStats: !!isPublicStats,
        });

        results.push({
          row: rowNum,
          originalUrl,
          shortCode,
          shortUrl: `${baseUrl}/${shortCode}`,
          success: true,
        });
      } catch (dbErr) {
        results.push({ row: rowNum, originalUrl, success: false, error: dbErr.message });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.length - successCount;

    return res.status(201).json({
      success: true,
      summary: { total: results.length, succeeded: successCount, failed: failCount },
      results,
    });
  } catch (error) {
    next(error);
  }
};

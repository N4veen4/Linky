import Url from '../models/Url.js';
import Analytics from '../models/Analytics.js';
import { generateShortCode } from '../utils/generateShortCode.js';

// Helper to validate URL
const isValidUrl = (urlStr) => {
  try {
    let str = urlStr;
    if (!str.startsWith('http://') && !str.startsWith('https://')) {
      str = 'https://' + str;
    }
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

// Helper to format URL and get host
const getHostname = (urlStr) => {
  try {
    if (!urlStr.startsWith('http://') && !urlStr.startsWith('https://')) {
      urlStr = 'https://' + urlStr;
    }
    const myUrl = new URL(urlStr);
    return myUrl.hostname.replace('www.', '');
  } catch (error) {
    return 'Webpage';
  }
};

// @desc    Create a short URL
// @route   POST /api/url/shorten
// @access  Private
export const createShortUrl = async (req, res, next) => {
  try {
    const { originalUrl, customAlias, expiresAt, isPublicStats } = req.body;

    if (!originalUrl) {
      return res.status(400).json({
        success: false,
        error: 'Original URL is required',
      });
    }

    // Validate URL format
    if (!isValidUrl(originalUrl)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid HTTP or HTTPS URL',
      });
    }

    // Max length checks
    if (originalUrl.length > 2048) {
      return res.status(400).json({
        success: false,
        error: 'URL is too long (max 2048 characters)',
      });
    }

    let shortCode;

    // Handle Custom Alias
    if (customAlias) {
      const trimmedAlias = customAlias.trim();

      // Max length check
      if (trimmedAlias.length > 50) {
        return res.status(400).json({
          success: false,
          error: 'Custom alias is too long (max 50 characters)',
        });
      }

      // Check if alias contains invalid characters
      const aliasRegex = /^[a-zA-Z0-9-_]+$/;
      if (!aliasRegex.test(trimmedAlias)) {
        return res.status(400).json({
          success: false,
          error: 'Alias can only contain alphanumeric characters, hyphens, and underscores',
        });
      }

      // Check if shortCode or customAlias already exists
      const aliasExists = await Url.findOne({
        $or: [{ shortCode: trimmedAlias }, { customAlias: trimmedAlias }],
      });

      if (aliasExists) {
        return res.status(400).json({
          success: false,
          error: 'Custom alias is already in use',
        });
      }

      shortCode = trimmedAlias;
    } else {
      // Generate unique shortCode
      let unique = false;
      let attempts = 0;
      while (!unique && attempts < 10) {
        shortCode = generateShortCode();
        const codeExists = await Url.findOne({
          $or: [{ shortCode }, { customAlias: shortCode }],
        });
        if (!codeExists) {
          unique = true;
        }
        attempts++;
      }

      if (!unique) {
        return res.status(500).json({
          success: false,
          error: 'Failed to generate a unique short code. Please try again.',
        });
      }
    }

    // Set a friendly default title using hostname
    const title = getHostname(originalUrl);

    const newUrl = await Url.create({
      originalUrl,
      shortCode,
      customAlias: customAlias ? customAlias.trim() : undefined,
      title,
      creator: req.user._id,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      isPublicStats: !!isPublicStats,
    });

    res.status(201).json({
      success: true,
      data: newUrl,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's URLs
// @route   GET /api/url
// @access  Private
export const getMyUrls = async (req, res, next) => {
  try {
    const urls = await Url.find({ creator: req.user._id }).sort({ createdAt: -1 });

    // Batch-fetch all click counts in a single aggregation (O(1) instead of O(N))
    const urlIds = urls.map((u) => u._id);
    const clickCounts = await Analytics.aggregate([
      { $match: { urlId: { $in: urlIds } } },
      { $group: { _id: '$urlId', clicks: { $sum: 1 } } },
    ]);

    // Build a lookup map: urlId -> clicks
    const clickMap = {};
    clickCounts.forEach((c) => {
      clickMap[c._id.toString()] = c.clicks;
    });

    const data = urls.map((url) => ({
      ...url.toObject(),
      clicks: clickMap[url._id.toString()] || 0,
    }));

    res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a URL
// @route   DELETE /api/url/:id
// @access  Private
export const deleteUrl = async (req, res, next) => {
  try {
    const url = await Url.findById(req.params.id);

    if (!url) {
      return res.status(404).json({
        success: false,
        error: 'URL not found',
      });
    }

    // Check ownership
    if (url.creator.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        error: 'User not authorized to delete this URL',
      });
    }

    // Delete URL
    await Url.findByIdAndDelete(req.params.id);

    // Clean up analytics associated with this URL
    await Analytics.deleteMany({ urlId: req.params.id });

    res.json({
      success: true,
      message: 'URL and related analytics deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Edit a URL (originalUrl, customAlias, expiresAt)
// @route   PUT /api/url/:id
// @access  Private
export const editUrl = async (req, res, next) => {
  try {
    const { originalUrl, customAlias, expiresAt } = req.body;
    const url = await Url.findById(req.params.id);

    if (!url) {
      return res.status(404).json({ success: false, error: 'URL not found' });
    }

    // Ownership check
    if (url.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized to edit this URL' });
    }

    // Validate new originalUrl if provided
    if (originalUrl !== undefined) {
      if (!originalUrl || !isValidUrl(originalUrl)) {
        return res.status(400).json({ success: false, error: 'Please provide a valid HTTP or HTTPS URL' });
      }
      if (originalUrl.length > 2048) {
        return res.status(400).json({ success: false, error: 'URL is too long (max 2048 characters)' });
      }
      url.originalUrl = originalUrl;
      url.title = getHostname(originalUrl);
    }

    // Validate new customAlias if provided
    if (customAlias !== undefined) {
      if (customAlias === '') {
        // Clearing the alias is not supported — shortCode is the permanent identifier
        return res.status(400).json({ success: false, error: 'Custom alias cannot be cleared once set' });
      }

      const trimmedAlias = customAlias.trim();

      if (trimmedAlias.length > 50) {
        return res.status(400).json({ success: false, error: 'Custom alias is too long (max 50 characters)' });
      }

      const aliasRegex = /^[a-zA-Z0-9-_]+$/;
      if (!aliasRegex.test(trimmedAlias)) {
        return res.status(400).json({
          success: false,
          error: 'Alias can only contain alphanumeric characters, hyphens, and underscores',
        });
      }

      // Check alias uniqueness (exclude current document)
      const aliasExists = await Url.findOne({
        _id: { $ne: url._id },
        $or: [{ shortCode: trimmedAlias }, { customAlias: trimmedAlias }],
      });

      if (aliasExists) {
        return res.status(400).json({ success: false, error: 'Custom alias is already in use' });
      }

      url.customAlias = trimmedAlias;
    }

    // Update expiry
    if (expiresAt !== undefined) {
      url.expiresAt = expiresAt ? new Date(expiresAt) : undefined;
    }

    await url.save();

    res.json({ success: true, data: url });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle Public Stats
// @route   PUT /api/url/:id/public-toggle
// @access  Private
export const togglePublicStats = async (req, res, next) => {
  try {
    const { isPublicStats } = req.body;
    const url = await Url.findById(req.params.id);

    if (!url) {
      return res.status(404).json({
        success: false,
        error: 'URL not found',
      });
    }

    // Check ownership
    if (url.creator.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        error: 'User not authorized to modify this URL',
      });
    }

    url.isPublicStats = isPublicStats;
    await url.save();

    res.json({
      success: true,
      data: url,
    });
  } catch (error) {
    next(error);
  }
};

import Url from '../models/Url.js';
import Analytics from '../models/Analytics.js';
import { UAParser } from 'ua-parser-js';
import { lookupGeo } from '../utils/geoLookup.js';

// Helper to sanitize and categorize Referrers
const categorizeReferrer = (ref) => {
  if (!ref) return 'Direct';
  try {
    const url = new URL(ref);
    const host = url.hostname.toLowerCase();

    if (host.includes('google.') || host.includes('bing.') || host.includes('yahoo.') || host.includes('duckduckgo.')) {
      return 'Search Engines';
    }
    if (
      host.includes('t.co') ||
      host.includes('twitter.com') ||
      host.includes('facebook.com') ||
      host.includes('instagram.com') ||
      host.includes('linkedin.com') ||
      host.includes('reddit.com') ||
      host.includes('youtube.com')
    ) {
      return 'Social Media';
    }
    return host.replace('www.', '');
  } catch (e) {
    return 'Referral';
  }
};

// HTML Template for expired or not found URLs
const renderErrorHtml = (title, message, subtext) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title} | URL Shortener</title>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&display=swap" rel="stylesheet">
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: 'Outfit', sans-serif;
          background: radial-gradient(circle at center, #1e1b4b 0%, #030712 100%);
          color: #f3f4f6;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          text-align: center;
        }
        .container {
          background: rgba(255, 255, 255, 0.03);
          border: 1px rgba(255, 255, 255, 0.08) solid;
          backdrop-filter: blur(12px);
          padding: 3rem;
          border-radius: 24px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
          max-width: 450px;
          width: 90%;
        }
        h1 {
          font-size: 2.5rem;
          background: linear-gradient(135deg, #f43f5e, #ec4899);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 1rem;
        }
        p {
          font-size: 1.1rem;
          color: #d1d5db;
          line-height: 1.6;
          margin-bottom: 2rem;
        }
        .btn {
          display: inline-block;
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          color: #ffffff;
          padding: 0.8rem 2rem;
          border-radius: 12px;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
        }
        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(99, 102, 241, 0.6);
        }
        .subtext {
          font-size: 0.85rem;
          color: #6b7280;
          margin-top: 1.5rem;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>${title}</h1>
        <p>${message}</p>
        <a href="/" class="btn">Go to Dashboard</a>
        <div class="subtext">${subtext}</div>
      </div>
    </body>
    </html>
  `;
};

// @desc    Redirect to original URL
// @route   GET /:shortCode
// @access  Public
export const redirectUrl = async (req, res, next) => {
  try {
    const { shortCode } = req.params;

    // Search by shortCode or customAlias
    const url = await Url.findOne({
      $or: [{ shortCode }, { customAlias: shortCode }],
    });

    if (!url) {
      res.status(404);
      if (req.accepts('html')) {
        return res.send(renderErrorHtml('Link Not Found', 'The link you are trying to reach does not exist or has been deleted.', '404 - Not Found'));
      }
      return res.json({ success: false, error: 'URL not found' });
    }

    // Check expiration
    if (url.expiresAt && new Date(url.expiresAt) < new Date()) {
      res.status(410);
      if (req.accepts('html')) {
        return res.send(renderErrorHtml('Link Expired', 'This link has reached its expiration date and is no longer available.', '410 - Link Expired'));
      }
      return res.json({ success: false, error: 'URL has expired' });
    }

    // Track analytics asynchronously
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || '';
    const rawReferrer = req.headers['referer'] || req.headers['referrer'] || '';

    // Parse User Agent
    const parser = new UAParser(userAgent);
    const browser = parser.getBrowser().name || 'Unknown';
    const os = parser.getOS().name || 'Unknown';
    
    // Parse device type
    let device = parser.getDevice().type || 'Desktop';
    device = device.charAt(0).toUpperCase() + device.slice(1); // Capitalize first letter

    // Lookup GeoIP
    const geo = lookupGeo(ip);
    const referrer = categorizeReferrer(rawReferrer);

    // Save analytics in background
    Analytics.create({
      urlId: url._id,
      shortCode: url.shortCode,
      ip,
      userAgent,
      browser,
      os,
      device,
      country: geo.country,
      region: geo.region,
      city: geo.city,
      referrer,
    }).catch((err) => console.error('Error logging analytics:', err));

    // Redirect to original URL
    let targetUrl = url.originalUrl;
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'http://' + targetUrl;
    }

    return res.redirect(302, targetUrl);
  } catch (error) {
    next(error);
  }
};

// Common aggregation compiler
const compileAnalyticsData = async (urlId) => {
  // Aggregate stats
  const totalClicks = await Analytics.countDocuments({ urlId });
  const uniqueUsers = await Analytics.distinct('ip', { urlId });
  const uniqueClicks = uniqueUsers.length;

  const devices = await Analytics.aggregate([
    { $match: { urlId } },
    { $group: { _id: '$device', count: { $sum: 1 } } },
    { $project: { name: '$_id', value: '$count', _id: 0 } },
  ]);

  const browsers = await Analytics.aggregate([
    { $match: { urlId } },
    { $group: { _id: '$browser', count: { $sum: 1 } } },
    { $project: { name: '$_id', value: '$count', _id: 0 } },
    { $sort: { value: -1 } },
  ]);

  const countries = await Analytics.aggregate([
    { $match: { urlId } },
    { $group: { _id: '$country', count: { $sum: 1 } } },
    { $project: { name: '$_id', value: '$count', _id: 0 } },
    { $sort: { value: -1 } },
  ]);

  const referrers = await Analytics.aggregate([
    { $match: { urlId } },
    { $group: { _id: '$referrer', count: { $sum: 1 } } },
    { $project: { name: '$_id', value: '$count', _id: 0 } },
    { $sort: { value: -1 } },
  ]);

  // Timeline data: group clicks by day
  const timeline = await Analytics.aggregate([
    { $match: { urlId } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
        clicks: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        date: '$_id',
        clicks: 1,
        _id: 0,
      },
    },
  ]);

  return {
    summary: {
      totalClicks,
      uniqueClicks,
    },
    devices,
    browsers,
    countries,
    referrers,
    timeline,
  };
};

// @desc    Get detailed stats for short code (Private to Creator)
// @route   GET /api/analytics/:shortCode
// @access  Private
export const getStatsByShortCode = async (req, res, next) => {
  try {
    const { shortCode } = req.params;

    const url = await Url.findOne({
      $or: [{ shortCode }, { customAlias: shortCode }],
    });

    if (!url) {
      return res.status(404).json({
        success: false,
        error: 'URL not found',
      });
    }

    // Check ownership
    if (url.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view analytics for this URL',
      });
    }

    const analytics = await compileAnalyticsData(url._id);

    res.json({
      success: true,
      url,
      analytics,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get public stats for short code (Access if isPublicStats is true)
// @route   GET /api/analytics/public/:shortCode
// @access  Public
export const getPublicStatsByShortCode = async (req, res, next) => {
  try {
    const { shortCode } = req.params;

    const url = await Url.findOne({
      $or: [{ shortCode }, { customAlias: shortCode }],
    });

    if (!url) {
      return res.status(404).json({
        success: false,
        error: 'URL not found',
      });
    }

    if (!url.isPublicStats) {
      return res.status(403).json({
        success: false,
        error: 'Public analytics are disabled for this URL',
      });
    }

    const analytics = await compileAnalyticsData(url._id);

    res.json({
      success: true,
      url: {
        title: url.title,
        shortCode: url.shortCode,
        customAlias: url.customAlias,
        originalUrl: url.originalUrl,
        createdAt: url.createdAt,
      },
      analytics,
    });
  } catch (error) {
    next(error);
  }
};

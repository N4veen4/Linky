import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema(
  {
    urlId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Url',
      required: true,
    },
    shortCode: {
      type: String,
      required: true,
      index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    ip: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
    },
    browser: {
      type: String,
      default: 'Unknown',
    },
    os: {
      type: String,
      default: 'Unknown',
    },
    device: {
      type: String,
      default: 'Desktop', // Desktop, Mobile, Tablet, Bot
    },
    country: {
      type: String,
      default: 'Unknown',
    },
    region: {
      type: String,
      default: 'Unknown',
    },
    city: {
      type: String,
      default: 'Unknown',
    },
    referrer: {
      type: String,
      default: 'Direct',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast queries
analyticsSchema.index({ urlId: 1, timestamp: -1 });

const Analytics = mongoose.model('Analytics', analyticsSchema);
export default Analytics;

const mongoose = require('mongoose');

const loginHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserAuth',
      required: true
    },
    ipAddress: String,
    userAgent: String,
    deviceId: String,
    method: {
      type: String,
      enum: ['password', 'google', 'github', 'facebook']
    },
    status: { type: String, enum: ['success', 'failed', 'locked'] },
    createdAt: {
      // Explicit field for TTL (required)
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true // Fixed typo from 'timestamp' to 'timestamps'
  }
);

// Add TTL index - records will expire after 90 days (adjust as needed)
loginHistorySchema.index({ createdAt: 1 }, { expireAfterSeconds: 10 * 60 });

// Add index for frequently queried fields
loginHistorySchema.index({ userId: 1 });
loginHistorySchema.index({ status: 1 });
loginHistorySchema.index({ method: 1 });

module.exports = mongoose.model('LoginHistory', loginHistorySchema);

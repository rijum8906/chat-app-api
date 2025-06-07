const mongoose = require('mongoose');

const signinHistorySchema = new mongoose.Schema(
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
signinHistorySchema.index({ createdAt: 1 }, { expireAfterSeconds: 10 * 60 });

// Add index for frequently queried fields
signinHistorySchema.index({ userId: 1 });
signinHistorySchema.index({ status: 1 });
signinHistorySchema.index({ method: 1 });

module.exports = mongoose.model('signinHistory', signinHistorySchema);

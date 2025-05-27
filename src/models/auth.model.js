const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userAuthSchema = new mongoose.Schema(
  {
    // --- Core Auth Fields ---
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      minlength: [8, 'Password must be at least 8 characters']
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      trim: true,
      match: [
        /^[a-z0-9_]+$/,
        'Username must be lowercase alphanumeric + underscores'
      ],
      minlength: 3,
      maxlength: 30
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },

    // --- Account Security ---
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetTokenExpires: Date,
    isTFAEnabled: {
      type: Boolean,
      default: false
    },
    TFASecret: {
      type: String,
      select: false
    },

    // --- Social Logins ---
    socialLogins: {
      google: {
        id: { type: String },
        email: String
      },
      github: {
        id: { type: String },
        email: String
      }
    },

    // --- Login Information ---
    lastLogin: {
      timestamp: {
        type: Date,
        default: Date.now
      },
      ipAddress: String,
      deviceId: String
    },
    activeSessions: [
      {
        token: String,
        ipAddress: String,
        userAgent: String,
        deviceId: String,
        createdAt: {
          type: Date,
          default: Date.now
        },
        lastUsed: {
          type: Date,
          default: Date.now
        }
      }
    ],

    // --- Account Status ---
    registrationMethod: {
      type: String,
      enum: ['password', 'google', 'github', 'facebook'],
      default: 'password'
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isLocked: {
      type: Boolean,
      default: false
    },
    failedLoginAttempts: [
      {
        ipAddress: String,
        userAgent: String,
        timestamp: {
          type: Date,
          default: Date.now
        }
      }
    ],
    lockUntil: Date,

    // --- Linked Schemas ---
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile',
      required: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// ======================
// MIDDLEWARE & METHODS
// ======================

// --- Password Hashing ---
userAuthSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    this.password = await bcrypt.hash(this.password, 12);
    if (!this.isNew) this.passwordChangedAt = Date.now() - 1000; // 1 sec ago
    next();
  } catch (err) {
    next(err);
  }
});

// --- Password Comparison ---
userAuthSchema.methods.comparePassword = async function (candidatePassword) {
  if (this.password) {
    return await bcrypt.compare(candidatePassword, this.password);
  } else {
    return false;
  }
};

// --- Password Reset Token ---
userAuthSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

// --- Add/Update Sessions on Login ---
userAuthSchema.methods.addSession = function (sessionInfo) {
  // Find existing session for this device
  const existingSessionIndex = this.activeSessions.findIndex(
    session => session.deviceId === sessionInfo.deviceId
  );

  if (existingSessionIndex >= 0) {
    // Update existing session
    this.activeSessions[existingSessionIndex].lastUsed = Date.now();
  } else {
    // Add new session
    this.activeSessions.push(sessionInfo);
  }
};

// --- Account Locking for Brute Force ---
userAuthSchema.methods.incrementLoginAttempts = function (deviceInfo) {

  this.loginAttempts;
};

// --- Indexes ---
userAuthSchema.index({ email: 1 }, { unique: true });
userAuthSchema.index({ username: 1 }, { unique: true });
userAuthSchema.index({ 'socialLogins.google.id': 1 });
userAuthSchema.index({ 'socialLogins.github.id': 1 });

const Auth = mongoose.model('UserAuth', userAuthSchema);
module.exports = Auth;

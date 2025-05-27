const crypto = require('crypto');

/**
 * Generates a persistent device ID from request data.
 * @param {Request} req - Express request object.
 * @returns {string} SHA-256 hash of the device fingerprint.
 */
function generateDeviceId(req, res, next) {
  // 1. Extract stable identifiers from the request
  const fingerprintParts = [
    req.headers['user-agent'], // Browser/OS
    req.headers['accept-language'], // Language settings
    req.headers['sec-ch-ua'], // Browser brand (Chrome, Edge)
    req.headers['sec-ch-ua-platform'] || req.headers['x-operating-system'], // OS
    req.ip.replace(/\.|:/g, ''), // Sanitized IP (v4/v6)
    req.headers['x-client-hints'] // If available (requires opt-in)
  ]
    .filter(Boolean)
    .join('|');

  // 2. Hash the fingerprint to ensure consistency
  req.session = {
    ...(req.session || {}),
    deviceId: crypto.createHash('sha256').update(fingerprintParts).digest('hex')
  };

  next();
}

module.exports = generateDeviceId;

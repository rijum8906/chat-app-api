const generateSessionInfo = require('./session.middleware');
const generateDeviceId = require('./deviceId.middleware');
const errorHandler = require('./error.middleware');

module.exports = {
  generateDeviceId,
  generateSessionInfo,
  errorHandler
};

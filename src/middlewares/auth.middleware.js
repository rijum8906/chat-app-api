const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const appError = require('./../utils/error.utils');
const { compareKey } = require('./../utils/redis.utils');

const authenticateAccessToken = asyncHandler(async (req, res, next) => {
  const accessToken =
    req.cookies.accessToken ||
    req.headers.authorization?.replace('Bearer ', '');

  if (!accessToken) {
    throw new appError('Token is not provided', 401);
  }

  try {
    // Verify the Token
    const decoded = await jwt.verify(accessToken, process.env.JWT_SECRET_KEY);
    if (!decoded) {
      throw new appError('Invalid token', 401);
    }

    // Check if it is stored in Redis
    const isAvailableInRedis = await compareKey(decoded.sub, accessToken);
    if (!isAvailableInRedis) {
      throw new appError("Token didn't match.", 401);
    }

    req.user = { ...decoded, accessToken };
    next();
  } catch (err) {
    throw new appError('Token Verification Failed.', 401);
  }
});

module.exports = authenticateAccessToken;

const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const AppError = require('./../utils/error.utils');
const { compareKey } = require('./../utils/redis.utils');

const authenticateAccessToken = asyncHandler(async (req, res, next) => {
  const accessToken = req.cookies.accessToken || req.headers.authorization?.replace('Bearer ', '');

  if (!accessToken) {
    throw new AppError('Token is not provided', 401);
  }

  try {
    // Verify the Token
    const decoded = await jwt.verify(accessToken, process.env.JWT_SECRET_KEY);
    if (!decoded) {
      throw new AppError('Invalid token', 401);
    }

    // Check if it is stored in Redis
    const isAvailableInRedis = await compareKey(decoded.sub, accessToken);
    if (!isAvailableInRedis) {
      throw new AppError("Token didn't match.", 401);
    }

    req.user = { ...decoded, accessToken };
    next();
  } catch (err) {
    throw new AppError('Token Verification Failed.', 401);
  }
});

module.exports = authenticateAccessToken;

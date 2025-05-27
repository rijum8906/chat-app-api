const jwt = require('jsonwebtoken');
const UserLoginHistory = require('./../models/loginHistory.model.js');
const UserProfile = require('./../models/profile.model');
const redisClient = require('./../configs/redis.config');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Format user data by populating profile information
 * @param {Object} user - User document
 * @returns {Object} formatted user data with profile info
 */
const formatLoginData = async user => {
  const userData = await user.populate('profileId');
  const { username, email, profile } = userData;
  return {
    id: user._id,
    username,
    email,
    profile
  };
};

/**
 * Generate JWT token (access or refresh)
 * @param {Object} params
 * @param {Boolean} params.isRefreshToken - Flag to generate refresh token
 * @param {Object} params.user - User object containing details for payload
 * @returns {String} Signed JWT token
 */
const generateToken = ({ isRefreshToken, user }) => {
  const expiresIn = isRefreshToken
    ? process.env.JWT_REFRESH_EXPIRES_IN
    : process.env.JWT_ACCESS_EXPIRES_IN;
  const secretKey = process.env.JWT_SECRET;

  // Create payload based on token type
  const payload = isRefreshToken
    ? { sub: user._id }
    : {
        sub: user._id,
        profile: {
          id: user.profileId._id,
          firstName: user.profileId.firstName,
          lastName: user.profileId.lastName,
          avatarURL: user.profileId.avatarURL
        },
        role: user.role,
        username: user.username,
        email: user.email,
        
      };

  return jwt.sign(payload, secretKey, { expiresIn });
};

/**
 * Perform user login steps including token generation, session tracking, and login history
 * @param {Object} user - User document
 * @param {Object} sessionInfo - Session related info (IP, device, userAgent, etc.)
 * @param {String} method - Authentication method ('password', 'google', etc.)
 * @returns {Object} Contains accessToken and refreshToken
 */
module.exports.loginToDatabase = async (user, sessionInfo, method) => {
  const userInfo = await user.populate('profileId');

  // Generate JWT refresh and access tokens
  const refreshToken = generateToken({ isRefreshToken: true, user: userInfo });
  const accessToken = generateToken({ user: userInfo });

  // Store access token in Redis with expiration (15 minutes)
  await redisClient.setEx(user._id.toString(), 60 * 15, accessToken, (err) => {
    if (err) throw new Error('Failed to save token to Redis');
  });

  // Add current session to user's active sessions
  user.addSession({
    token: refreshToken,
    ...sessionInfo,
    method
  });

  // Record login history for auditing
  const newLoginData = new UserLoginHistory({
    userId: user._id,
    ...sessionInfo,
    method
  });

  await user.save();
  await newLoginData.save();

  return {
    accessToken,
    refreshToken
  };
};

/**
 * Verify Google OAuth token and extract user information
 * @param {String} token - Google ID token
 * @returns {Object} Token data with user details
 * @throws Will throw error if token verification fails
 */
module.exports.verifyGoogleToken = async token => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const {
      email,
      sub,
      given_name: firstName,
      family_name: lastName,
      picture: avatarURL
    } = payload;

    return { email, sub, firstName, lastName, avatarURL };
  } catch (err) {
    // Throw an error for upstream handling
    throw new Error('Google token verification failed: ' + err.message);
  }
};
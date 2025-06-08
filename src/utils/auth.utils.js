const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const UserSigninHistory = require('./../models/signinHistory.model.js');
const UserProfile = require('./../models/profile.model');
const redisClient = require('./../configs/redis.config');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Generate JWT token (access or refresh)
 * @param {Object} params
 * @param {Boolean} params.isRefreshToken - Flag to generate refresh token
 * @param {Object} params.user - User object containing details for payload
 * @returns {String} Signed JWT token
 */
const generateToken = ({ isRefreshToken, user }) => {
  const expiresIn = isRefreshToken ? process.env.JWT_REFRESH_EXPIRES_IN : process.env.JWT_ACCESS_EXPIRES_IN;
  const secretKey = process.env.JWT_SECRET;

  // Create payload based on token type
  const payload = isRefreshToken
    ? { jti: crypto.randomUUID() }
    : {
        sub: user.sub,
        roles: user.roles,
        username: user.username
      };

  return jwt.sign(payload, secretKey, { algorithm: 'HS256', expiresIn });
};

/**
 * Format user data so swnd to Client
 * @param {Object} user - User mongoose document
 */
 const formatUser = (user) => {
   return {
     sub: user._id.toString(),
     username: user.username,
     email: user.email,
     profile: {
       id: user.profileId._id.toString(),
       displayName: user.profileId.displayName,
       avatarURL: user.profileId.avatarURL
     }
   }
 }

/**
 * Perform user signin steps including token generation, session tracking, and signin history
 * @param {Object} user - User document
 * @param {Object} sessionInfo - Session related info (IP, device, userAgent, etc.)
 * @param {String} method - Authentication method ('password', 'google', etc.)
 * @returns {Object} Contains accessToken and refreshToken
 */
module.exports.signinToDatabase = async (user, sessionInfo, method) => {
  
  user = await user.populate('profileId');

  // Generate JWT refresh and access tokens
  const refreshToken = generateToken({ isRefreshToken: true, user });
  const accessToken = generateToken({ user });

  // Store access token in Redis with expiration (15 minutes)
  await redisClient.setEx(user._id?.toString() || user.sub.toString(), 60 * 15, accessToken, err => {
    if (err) throw new Error('Failed to save token to Redis');
  });

  // Add current session to user's active sessions
  user.addSession({
    token: refreshToken,
    ...sessionInfo,
    method
  });

  // Record signin history for auditing
  const newsigninData = new UserSigninHistory({
    userId: user._id,
    ...sessionInfo,
    method
  });

  await user.save();
  await newsigninData.save();

  return {
    accessToken,
    refreshToken,
    user: formatUser(user)
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
    const { email, sub, given_name: firstName, family_name: lastName, picture: avatarURL } = payload;

    return { email, sub, firstName, lastName, avatarURL };
  } catch (err) {
    // Throw an error for upstream handling
    throw new Error('Google token verification failed: ' + err.message);
  }
};

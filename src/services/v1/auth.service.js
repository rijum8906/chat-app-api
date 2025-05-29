const Auth = require('./../../models/auth.model');
const UserLoginHistory = require('./../../models/loginHistory.model');
const UserProfile = require('./../../models/profile.model');
const appError = require('./../../utils/error.utils');
const {
  loginToDatabase,
  verifyGoogleToken
} = require('./../../utils/auth.utils');
const redisClient = require('./../../configs/redis.config');

/**
 * Login a user with correct credentials
 * @param {Object} params - Login parameters
 * @param {Object} params.sessionInfo - Session and device metadata
 * @param {Object} params.userInfo - Contains username/email and password
 * @returns {Object} JWT tokens and user session data
 */
module.exports.loginUserByPass = async ({ sessionInfo, userInfo }) => {
  const { username, password, email } = userInfo;

  // Step 1: Fetch user by username or email
  const fetchedUser = (await Auth.aggregate([
  {
    $match: {
      $or: [
        { username },
        { email }
      ]
    }
  },
  {
    $lookup: {
      from: "profiles",
      localField: "profileId",
      foreignField: "_id",
      as: "profile"
    }
  },
  {
    $unwind: "$profile"
  },
  {
    $project: {
      _id: 0,
      sub: "$_id",
      email: 1,
      username: 1,
      profile: {
        firstName: "$profile.firstName",
        lastName: "$profile.lastName",
        avatarURL: "$profile.avatarURL",
      }
    }
  }
]))[0];

  // Step 2: Validate credentials
  if (!fetchedUser || !(await fetchedUser.comparePassword(password))) {
    throw new appError('Invalid credentials', 404);
  }

  // Step 3: Check if account is locked (e.g., due to repeated failed attempts)
  if (fetchedUser.isLocked) {
    throw new appError('Too many login attempts. Account is locked.', 429);
  }

  // Step 4: Create login session and generate access/refresh tokens
  const responseData = await loginToDatabase(
    fetchedUser,
    sessionInfo,
    'password' // Indicates login method used
  );

  return responseData;
};

/**
 * Register a new user with password authentication
 * @param {Object} params - Registration parameters
 * @param {Object} params.sessionInfo - Session and device metadata
 * @param {Object} params.userInfo - User registration data
 * @returns {Object} JWT tokens and user session data
 */
module.exports.registerByPassword = async ({ sessionInfo, userInfo }) => {
  const { firstName, lastName, username, email, password } = userInfo;

  // Step 1: Check if user with given email or username already exists
  const existingUser = await Auth.findOne({
    $or: [{ email }, { username }]
  });
  if (existingUser) {
    if (existingUser.email === email) {
      throw new appError('Email already in use', 409);
    } else {
      throw new appError('Username already taken', 409);
    }
  }

  // Step 2: Create a new user profile document with optional names and IP address
  const newUserProfile = new UserProfile({
    firstName,
    lastName
  });
  await newUserProfile.save();

  // Step 3: Create a new authentication record linked to the profile
  const newUser = new Auth({
    email,
    username,
    password,
    registrationMethod: 'password',
    profileId: newUserProfile._id
  });
  await newUser.save();

  // Step 4: Log the user in by creating session and generating tokens
  const responseData = await loginToDatabase(newUser, sessionInfo, 'password');

  // Step 5: Return the generated token and relevant user data
  return responseData;
};

/**
 * Login or register a user using Google OAuth
 * @param {Object} params - OAuth parameters
 * @param {Object} params.userInfo - User information from Google token
 * @param {Object} params.sessionInfo - Session and device metadata
 * @returns {Object} JWT token and user details
 */
module.exports.loginOrRegisterByGoogle = async ({ userInfo, sessionInfo }) => {
  const { firstName, lastName, sub, email, username, avatarURL } = userInfo;

  // Step 1: Attempt to find user by Google ID and email
  const fetchedUser = await Auth.findOne({
    email,
    'socialLogins.google.id': sub
  });

  // Step 2: Check if a user with the given email exists (regardless of Google link)
  const isUserExists = await Auth.findOne({ email });

  if (fetchedUser) {
    // Case 1: User exists and is linked with Google ID
    // Proceed with login flow
    const responseData = await loginToDatabase(fetchedUser, sessionInfo, 'google');
    return responseData;

  } else if (isUserExists) {
    // Case 2: Email exists but not linked with Google account
    // Prevent duplicate accounts for same email
    throw new appError('Email already in use.', 409);

  } else {
    // Case 3: New user registration with Google OAuth
    // Create user profile with optional avatar and IP address
    const newUserProfile = new UserProfile({
      firstName,
      lastName,
      avatarURL,
      ipAddress: sessionInfo.ipAddress
    });
    await newUserProfile.save();

    // Create new authentication document with Google info linked
    const newUser = new Auth({
      email,
      username,
      registrationMethod: 'google',
      isEmailVerified: true,
      profileId: newUserProfile._id
    });
    newUser.socialLogins.google = {
      id: sub,
      email
    };
    await newUser.save();

    // Complete login process and generate tokens
    const responseData = await loginToDatabase(newUser, sessionInfo, 'google');
    return responseData;
  }
};

/**
 * Logs out a user by removing the active session associated with the given deviceId
 * @param {Object} params
 * @param {String} params.deviceId - Identifier for the device/session to logout
 * @param {String} params.userId - User's unique ID
 * @throws {appError} If user not found or session does not exist
 * @returns {Boolean} true on successful logout
 */
module.exports.logoutUser = async ({ deviceId, userId }) => {
  // Step 1: Verify user exists
  const user = await Auth.findById(userId);
  if (!user) {
    throw new appError('Cannot logout an undefined user', 401);
  }

  // Step 2: Find the session index for the provided deviceId
  const index = user.activeSessions.findIndex(session => session.deviceId === deviceId);

  // Step 3: If no session found, throw an error
  if (index === -1) {
    throw new appError('Your session is not stored.', 401);
  }

  // Step 4: Remove the session from user's active sessions array
  user.activeSessions.splice(index, 1);
  await user.save();

  // Step 5: Remove the user's session data from Redis cache (if applicable)
  redisClient.del(user._id.toString());

  // Step 6: Indicate successful logout
  return true;
};

/**
 * Link a social account (e.g., Google) to an existing user account
 * @param {Object} params
 * @param {String} params.deviceId - Device identifier (currently unused, can be used for logging)
 * @param {Object} params.userInfo - Logged-in user info, must contain sub (user ID) and profileId
 * @param {String} params.linkWith - The social platform to link, e.g., 'google'
 * @param {String} params.token - OAuth token from the provider to verify
 * @throws {appError} Throws error if user not found, account already linked, or token/email mismatch
 * @returns {Boolean} Returns true if linking successful
 */
module.exports.linkUserAccount = async ({ deviceId, userInfo, linkWith, token }) => {
  // Fetch existing user by their ID
  const user = await Auth.findById(userInfo.sub);
  if (!user) {
    throw new appError('Could not find any user account to link.', 401);
  }

  // Check if the social account is already linked
  if (user.socialLogins[linkWith]?.id) {
    throw new appError('Account already linked.', 409);
  }

  // Handle linking for Google OAuth
  if (linkWith === "google") {
    // Verify the token with Google and get token data
    const tokenData = await verifyGoogleToken(token);

    // Check if the email from token matches the user's email
    if (user.email !== tokenData.email) {
      throw new appError("Cannot link to account. Email doesn't match.", 401);
    }

    // Update user's profile avatar with Google avatar
    const userProfile = await UserProfile.findById(userInfo.profileId);
    if (userProfile) {
      userProfile.avatarURL = tokenData.avatarURL;
      await userProfile.save();
    }

    // Save social login info on user
    user.socialLogins[linkWith] = {
      id: tokenData.sub,
      email: tokenData.email,
    };

    // Persist user changes
    await user.save();

    return true;
  }

  // If you want to support other providers, add more conditions here

  // If provider not supported, throw error
  throw new appError('Unsupported social login provider.', 400);
};
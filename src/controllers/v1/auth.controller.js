// Dependencies
const asyncHandler = require("express-async-handler");
const AppError = require("./../../utils/error.utils");
const { 
  signinSchema, 
  signupSchema, 
  googleAuthSchema, 
  accountLinkReqSchema
  } = require("./../../validators/auth.validator");
const { 
  signinUserByPass, 
  signinOrsignupByGoogle,
  signupByPassword,
  signoutUser,
  linkUserAccount 
} = require("./../../services/v1/auth.service");
const { 
  verifyGoogleToken 
} = require("./../../utils/auth.utils");

// Signin Controller
module.exports.signin = asyncHandler(async (req, res) => {
  const userInfo = req.body;
  const sessionInfo = req.session;

  // Step 1: Validate signin payload using Joi schema
  const { error: signinError } = signinSchema.validate(userInfo);
  if (signinError) {
    throw new AppError(signinError.details[0].message, 400);
  }

  // Step 2: Authenticate user and generate tokens
  const { accessToken, refreshToken } = await signinUserByPass({ sessionInfo, userInfo });

  // Step 3: Set refresh token as HTTP-only cookie for secure session management
  res.cookie("token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Use secure cookies in production
    sameSite: "lax", // Prevent CSRF in most modern browsers
  });

  // Step 4: Send access token in response body
  return res.status(200).json({
    success: true,
    data: {
      token: accessToken,
    },
  });
});

// signup Controller
module.exports.signup = asyncHandler(async (req, res) => {
  const userInfo = req.body;
  const sessionInfo = req.session;

  // Step 1: Validate user input using Joi schema
  const { error: signupError } = signupSchema.validate(userInfo);
  if (signupError) {
    throw new AppError(signupError.details[0].message, 400);
  }

  // Step 2: signup the user and generate authentication tokens
  const { accessToken, refreshToken } = await signupByPassword({ sessionInfo, userInfo });

  // Step 3: Set the refresh token as a secure, HTTP-only cookie
  res.cookie("token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Enable secure cookie in production
    sameSite: "lax", // Helps prevent CSRF
  });

  // Step 4: Send access token in response body
  return res.status(200).json({
    success: true,
    data: {
      token: accessToken,
    },
  });
});

// Google OAuth Controller
module.exports.googleAuth = asyncHandler(async (req, res) => {
  const { token } = req.body;

  // Step 1: Verify and decode the Google token
  const tokenData = await verifyGoogleToken(token);

  const sessionInfo = req.session;

  // Step 2: Generate a fallback username using email + part of the Google sub
  const username = (tokenData.email.split("@")[0] + tokenData.sub.substr(0, 5)).substr(0, 15);

  // Merge username with decoded token data
  const userInfo = { username, ...tokenData };

  // Step 3: Validate the final user object using Joi
  const { error: oauthError } = googleAuthSchema.validate(userInfo);
  if (oauthError) {
    throw new AppError(oauthError.details[0].message, 400);
  }

  // Step 4: Handle signin or signup logic via Google and generate tokens
  const { accessToken, refreshToken } = await signinOrsignupByGoogle({ sessionInfo, userInfo });

  // Step 5: Set refresh token in secure HTTP-only cookie
  res.cookie("token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Use secure cookies in production
    sameSite: "lax", // Helps mitigate CSRF
  });

  // Step 6: Return access token in the response body
  return res.status(200).json({
    success: true,
    data: {
      token: accessToken,
    },
  });
});


// signout Controller
module.exports.signout = asyncHandler(async (req, res) => {
  const { deviceId } = req.session;
  const userId = req.user.sub;

  // Step 1: Invalidate the session/device from the user's active sessions
  const success = await signoutUser({ deviceId, userId });
  
  // Step 2: Clear the cookies 
  res.clearCookie("token", {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
});

  // Step 3: Send signout status response
  return res.status(200).json({
    success,
  });
});

// Connect/Link Account Controller (e.g., link password account with Google)
module.exports.linkAccount = asyncHandler(async (req, res) => {
  const { token, linkWith } = req.body;
  const sessionInfo = req.session;
  const userInfo = req.user;

  // Step 1: Validate request body against Joi schema
  const { error: accountLinkReqError } = accountLinkReqSchema.validate(req.body);
  if (accountLinkReqError) {
    throw new AppError(accountLinkReqError.details[0].message, 400);
  }

  // Step 2: Process the account linking logic (e.g., link Google with password-based account)
  const success = await linkUserAccount({ userInfo, token, linkWith, sessionInfo });

  // Step 3: Return the result of the linking operation
  return res.status(200).json({
    success,
  });
});
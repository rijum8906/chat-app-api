// --- Dependencies ---
const asyncHandler = require("express-async-handler");
const AppError = require("./../../utils/error.utils");
const {
  getUserInfoService
} = require("./../../services/v1/friendship.service");


/**
 * @desc    Get public user information by username
 * @route   GET /users/:username
 * @access  Public
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 * @returns {Object} JSON response with public user info
 */
module.exports.getUserInfo = asyncHandler(async (req, res) => {
  const { username } = req.params;

  const userInfo = await getUserInfoService(username);

  return res.status(200).json({
    success: true,
    data: {
      user: userInfo
    }
  });
});
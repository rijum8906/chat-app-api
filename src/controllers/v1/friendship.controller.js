// --- Dependencies ---
const asyncHandler = require('express-async-handler');
const AppError = require('./../../utils/error.utils');
const { getFriendsService } = require('./../../services/v1/friendship.service');

/**
 * Get a paginated list of user's friends.
 *
 * @param {Number} limit - Number of friends to return.
 * @param {Number} skip - Number of friends to skip.
 */
module.exports.getFriends = asyncHandler(async (req, res) => {
  const userId = req.user.sub;

  // Parse and validate pagination query params
  const limit = parseInt(req.query.limit) || 10;
  const skip = parseInt(req.query.skip) || 0;

  // Optional: Validate numeric inputs more strictly if desired
  if (isNaN(limit) || isNaN(skip)) {
    throw new AppError("Query parameters 'limit' and 'skip' must be valid numbers.", 400);
  }

  const friends = await getFriendsService(userId, { limit, skip });

  return res.status(200).json({
    success: true,
    data: {
      friends
    }
  });
});

/**
 * Send a friend request to another user.
 *
 * @param {Object} req - Express request object
 * @param {String} req.user.sub - ID of the authenticated user (sender)
 * @param {String} req.params.receiverId - ID of the user to whom the friend request is being sent
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with success status and friend request info
 */
module.exports.sendFriendReq = asyncHandler(async (req, res) => {
  const senderId = req.user.sub;
  const { receiverId } = req.body;

  // Prevent sending a request to self
  if (senderId === receiverId) {
    throw new AppError('You cannot send a friend request to yourself.', 400);
  }

  const friendReq = await sendFriendReqService(senderId, receiverId);

  return res.status(201).json({
    success: true
  });
});

/**
 * Respond to a friend request (accept or reject).
 *
 * @route PATCH /api/friends/respond
 * @param {String} req.user.sub - Authenticated user's ID.
 * @param {String} req.body.requestId - ID of the friend request.
 * @param {String} req.body.action - Either "accept" or "reject".
 */
module.exports.respondToFriendReq = asyncHandler(async (req, res) => {
  const userId = req.user.sub;
  const { requestId, action } = req.body;

  if (!['accept', 'reject'].includes(action)) {
    throw new AppError("Action must be either 'accept' or 'reject'.", 400);
  }

  if (!requestId) {
    throw new AppError('Friend request ID is required.', 400);
  }

  const friend = await respondToFriendReqService(userId, requestId, action);

  return res.status(200).json({
    success: true
  });
});

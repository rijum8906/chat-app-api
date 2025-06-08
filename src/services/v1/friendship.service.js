// --- Dependenciesb ---
const Friendship = require('./../../models/friendship.model');
const AppError = require('./../../utils/error.utils');
const Profile = require('./../../models/profile.model');
const mongoose = require('mongoose');

// Pre defined variables
const ObjectId = mongoose.Types.ObjectId;

/**
 * Get paginated list of a user's friends.
 *
 * @param {String} userId - The ID of the user whose friends are to be retrieved.
 * @param {Object} options - Pagination options.
 * @param {Number} options.limit - Number of friends to return.
 * @param {Number} options.skip - Number of friends to skip.
 * @returns {Promise<Array>} - Returns a promise that resolves to an array of friend profiles.
 * @throws {AppError} - Throws an error if the user profile is not found.
 */
module.exports.getFriendsService = async (userId, { limit, skip }) => {
  const userFriends = await Friendship.aggregate([
    {
      $match: {
        status: 'accepted',
        $or: [{ senderId: new ObjectId(userId) }, { receiverId: new ObjectId(userId) }]
      }
    },
    {
      $addFields: {
        friendId: {
          $cond: {
            if: { $eq: ['$senderId', new ObjectId(userId)] },
            then: '$receiverId',
            else: '$senderId'
          }
        }
      }
    },
    {
      $lookup: {
        from: 'profiles',
        localField: 'friendId',
        foreignField: '_id',
        as: 'friend'
      }
    },
    {
      $unwind: '$friend'
    },
    {
      $project: {
        _id: 0,
        friendId: 1,
        'friend.firstName': 1,
        'friend.lastName': 1,
        'friend.username': 1,
        'friend.avatarURL': 1
      }
    },
    {
      $sort: {
        createdAt: -1
      }
    },
    {
      $limit: limit
    },
    {
      $skip: skip
    }
  ]);

  if (userFriends.length === 0) return [];

  return userFriends;
};

/**
 * Service to send a friend request.
 *
 * @param {String} senderId - ID of the user sending the friend request.
 * @param {String} receiverId - ID of the user receiving the friend request.
 * @returns {Object} The created friend request document.
 * @throws {AppError} If the request is invalid or already exists.
 */
module.exports.sendFriendReqService = async (senderId, receiverId) => {
  // Check if friendship already exists
  const existingRequest = await Friendship.findOne({
    $or: [
      { senderId, receiverId },
      { senderId: receiverId, receiverId: senderId }
    ]
  });

  if (existingRequest) {
    throw new AppError('Friend request already exists or you are already friends.', 409);
  }

  // Check if the receiver exists
  const receiverExists = await Profile.findById(receiverId);
  if (!receiverExists) {
    throw new AppError("The user you're trying to add does not exist.", 404);
  }

  // Create new friend request
  const newFriendRequest = new Friendship({
    senderId,
    receiverId,
    status: 'pending'
  });

  await newFriendRequest.save();

  return newFriendRequest;
};

/**
 * Service to accept or reject a friend request.
 *
 * @param {String} userId - The ID of the current user (receiver).
 * @param {String} requestId - The ID of the friendship request.
 * @param {"accept"|"reject"} action - Action to perform.
 * @returns {Object} Updated friendship document or null if rejected.
 * @throws {AppError} If the request is not found or unauthorized.
 */
module.exports.respondToFriendReqService = async (userId, requestId, action) => {
  const request = await Friendship.findById(requestId);

  if (!request) {
    throw new AppError('Friend request not found.', 404);
  }

  if (request.receiverId.toString() !== userId) {
    throw new AppError('You are not authorized to respond to this friend request.', 403);
  }

  if (request.status !== 'pending') {
    throw new AppError('This friend request has already been responded to.', 400);
  }

  if (action === 'reject') {
    await Friendship.findByIdAndDelete(requestId);
    return null;
  }

  request.status = 'accepted';
  await request.save();
  return request;
};

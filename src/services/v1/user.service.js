// --- Dependenciesb ---
const AppError = require('./../../utils/error.utils');
const Profile = require('./../../models/profile.model');
const Auth = require('./../../models/auth.model');


/**
 * Fetch public profile info of a user by username.
 * 
 * @param {String} username - The username to search for
 * @returns {Object} Public profile info (firstName, lastName, avatarURL, bio)
 * @throws {AppError} If no user is found with the given username
 */
module.exports.getUserInfoService = async (username) => {
  const fetchedUsers = await Auth.aggregate([
    {
      $match: {
        username: username
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
      $project: {
      _id: 0,
      username,
      firstName: { $arrayElemAt: ["$profile.firstName", 0] },
      lastName: { $arrayElemAt: ["$profile.lastName", 0] },
      avatarURL: { $arrayElemAt: ["$profile.avatarURL", 0] },
      bio: { $arrayElemAt: ["$profile.bio", 0] },
      id: { $arrayElemAt: ["$profile._id", 0] }
      }
    }
]);

  if (!fetchedUsers) {
    throw new AppError("No user found", 404);
  }

  return fetchedUsers;
};
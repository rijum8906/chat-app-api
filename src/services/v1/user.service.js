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
  const [fetchedUser] = await Auth.aggregate([
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
        firstName: "$profile.firstName",
        lastName: "$profile.lastName",
        avatarURL: "$profile.avatarURL",
        bio: "$profile.bio"
      }
    }
  ]);

  if (!fetchedUser) {
    throw new AppError("No user found", 404);
  }

  return fetchedUser;
};
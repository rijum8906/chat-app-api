const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema(
  {
    // --- Personal Details ---
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: 2,
      maxlength: 20
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      minlength: 2,
      maxlength: 20
    },
    displayName: {
      type: String,
      default: function () {
        return this.firstName;
      }
    },
    location: {
      type: String
    },
    ipAddress: {
      type: String,
      required: true
    },
    avatarURL: String,
    bio: String
  },
  { timestamps: true }
);

const Profile = mongoose.model('Profile', userProfileSchema);
module.exports = Profile;

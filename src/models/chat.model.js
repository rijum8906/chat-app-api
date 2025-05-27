const mongoose = require('mongoose');
const { Schema } = mongoose;

const chatSchema = new Schema(
  {
    chatName: {
      type: String,
      required: function () {
        return this.isGroupChat;
      },
      trim: true
    },
    isGroupChat: {
      type: Boolean,
      default: false
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile'
      }
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile',
      required: true
    },
    groupAdmins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
        required: function () {
          return this.isGroupChat;
        }
      }
    ],
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message'
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

module.exports = mongoose.model('Chat', chatSchema);

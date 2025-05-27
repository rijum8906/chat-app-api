const mongoose = require("mongoose");

const friendshipSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "blocked"],
      default: "pending"
    },
    respondedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

const Friendship = mongoose.model("Friendship", friendshipSchema);
module.exports = Friendship;
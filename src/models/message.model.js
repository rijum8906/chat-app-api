const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
    },
    chat: {
      type: mongoose.Schema.Types.oObjectId,
      ref: "Chat",
      required: true,
    },
    content: {
      type: String,
      enum: ["text","video","audio","file","image"],
      default: "text",
      required: true,
      trim: true,
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Profile",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

module.exports = mongoose.model("Message", messageSchema);

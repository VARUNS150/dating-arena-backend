const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema({
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  toUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId
  }
}, { timestamps: true });


// ✅ FIX: prevent duplicate likes
likeSchema.index(
  { fromUser: 1, toUser: 1, roomId: 1 },
  { unique: true }
);

module.exports = mongoose.model("Like", likeSchema);
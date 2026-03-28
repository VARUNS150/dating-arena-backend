const mongoose = require("mongoose");

const MatchSchema = new mongoose.Schema({
  user1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  user2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  compatibility: {
    type: Number,
    required: true
  },

  // 🔥 FIX: ObjectId → String
  roomId: {
    type: String,
    required: true
  }

}, { timestamps: true });

// 🔥 Prevent duplicate matches
MatchSchema.index(
  { user1: 1, user2: 1, roomId: 1 },
  { unique: true }
);

module.exports = mongoose.model("Match", MatchSchema);
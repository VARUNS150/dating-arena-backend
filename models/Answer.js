const mongoose = require("mongoose");

const AnswerSchema = new mongoose.Schema({
  userId: {   // ✅ FIXED (userid → userId)
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question",
    required: true
  },
  answer: {
    type: String,
    required: true
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Answer", AnswerSchema);
const mongoose = require("mongoose");

const AnswerSchema = new mongoose.Schema({
  userId: {
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

  // 🔥 FIX: ObjectId → String
  roomId: {
    type: String,
    required: true
  }

}, { timestamps: true });

module.exports = mongoose.model("Answer", AnswerSchema);
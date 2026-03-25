const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },

  category: {
    type: String
  }

});

module.exports = mongoose.model("Question", QuestionSchema);
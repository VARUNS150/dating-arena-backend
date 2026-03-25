const Question = require("../models/Question");

exports.getRandomQuestions = async (req, res) => {
  try {

    const questions = await Question.aggregate([
      { $sample: { size: 5 } }
    ]);

    res.json(questions);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
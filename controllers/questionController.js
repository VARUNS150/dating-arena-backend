const Question = require("../models/Question");

exports.getRandomQuestions = async (req, res) => {
  try {

    const { category } = req.query;

    let matchStage = {};

    if (category) {
      matchStage = { category: category };
    }

    const questions = await Question.aggregate([
      { $match: matchStage },
      { $sample: { size: 5 } }
    ]);

    console.log("🔥 RANDOM QUESTIONS:", questions.length);

    res.json(questions);

  } catch (error) {
    console.log("❌ ERROR:", error.message);
    res.status(500).json({ error: error.message });
  }
};
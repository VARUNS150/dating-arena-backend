const Answer = require("../models/Answer");

exports.saveAnswer = async (req, res) => {
  try {

    const { questionId, answer, roomId } = req.body;

    const userId = req.user.id;

    const newAnswer = new Answer({
      userId: userId,   // 🔥 IMPORTANT FIX
      questionId,
      answer,
      roomId
    });

    await newAnswer.save();

    res.json({ message: "Answer saved" });

  } catch (error) {
    console.log("❌ ANSWER ERROR:", error.message);
    res.status(500).json({ error: error.message });
  }
};
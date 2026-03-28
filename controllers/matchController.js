const mongoose = require("mongoose");
const Match = require("../models/Match");
const Answer = require("../models/Answer");

/* ---------------- CREATE MATCH ---------------- */

exports.createMatch = async (req, res) => {
  try {
    const { user1, user2, compatibility, roomId } = req.body;

    if (compatibility < 70) {
      return res.json({ message: "Compatibility too low" });
    }

    const user1Id = new mongoose.Types.ObjectId(user1);
    const user2Id = new mongoose.Types.ObjectId(user2);

    const existingMatch = await Match.findOne({
      $or: [
        { user1: user1Id, user2: user2Id, roomId },
        { user1: user2Id, user2: user1Id, roomId }
      ]
    });

    if (existingMatch) {
      return res.json({
        message: "Match already exists",
        match: existingMatch
      });
    }

    const newMatch = await Match.create({
      user1: user1Id,
      user2: user2Id,
      compatibility,
      roomId
    });

    res.json({
      message: "Match created",
      match: newMatch
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


/* ---------------- GET MATCHES ---------------- */

exports.getMatches = async (req, res) => {
  try {

    const userId = new mongoose.Types.ObjectId(req.user.id);

    const matches = await Match.find({
      $or: [
        { user1: userId },
        { user2: userId }
      ]
    })
    .populate("user1", "name email bio profilePic interests")
    .populate("user2", "name email bio profilePic interests")
    .sort({ createdAt: -1 });

    const enrichedMatches = await Promise.all(
      matches.map(async (match) => {

        // 🔥 FIX: define otherUser properly
        const isUser1 = String(match.user1._id) === String(userId);

        const otherUser = isUser1 ? match.user2 : match.user1;

        // 🔥 ANSWERS
        const answers = await Answer.find({
          roomId: String(match.roomId)
        }).populate("questionId", "text");

        const myAnswers = answers.filter(a =>
          String(a.userId) === String(userId)
        );

        const theirAnswers = answers.filter(a =>
          String(a.userId) !== String(userId)
        );

        return {
          ...match.toObject(),
          otherUser,        // ✅ FIXED
          myAnswers,
          theirAnswers,
          isMatched: true
        };
      })
    );

    res.json(enrichedMatches);

  } catch (error) {
    console.log("❌ GET MATCH ERROR:", error.message);
    res.status(500).json({ error: error.message });
  }
};
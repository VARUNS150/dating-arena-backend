const mongoose = require("mongoose");
const Match = require("../models/Match");
const Answer = require("../models/Answer");

/* ---------------- CREATE MATCH ---------------- */

exports.createMatch = async (req, res) => {
  try {
    const { user1, user2, compatibility, roomId } = req.body;

    if (compatibility < 70) {
      return res.json({
        message: "Compatibility too low"
      });
    }

    const user1Id = new mongoose.Types.ObjectId(user1);
    const user2Id = new mongoose.Types.ObjectId(user2);
    const roomObjId = new mongoose.Types.ObjectId(roomId);

    const existingMatch = await Match.findOne({
      $or: [
        { user1: user1Id, user2: user2Id, roomId: roomObjId },
        { user1: user2Id, user2: user1Id, roomId: roomObjId }
      ]
    });

    if (existingMatch) {
      return res.json({
        message: "Match already exists",
        match: existingMatch
      });
    }

    try {
      const newMatch = await Match.create({
        user1: user1Id,
        user2: user2Id,
        compatibility,
        roomId: roomObjId
      });

      res.json({
        message: "Match created",
        match: newMatch
      });

    } catch (err) {
      if (err.code === 11000) {
        return res.json({ message: "Already matched" });
      }
      throw err;
    }

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


/* ---------------- GET MATCHES (FINAL 🔥 NO BUG) ---------------- */

exports.getMatches = async (req, res) => {
  try {

    // 🔥 KEEP STRING (VERY IMPORTANT)
    const userId = req.user.id;

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

        const answers = await Answer.find({
          roomId: match.roomId
        }).populate("questionId", "text");

        // 🔥 DEBUG START
        console.log("======== DEBUG ========");
        console.log("REQ USER:", userId);
        console.log("ROOM:", match.roomId.toString());
        console.log("ANS USERS:", answers.map(a => a.userid?.toString()));
        console.log("TOTAL ANSWERS:", answers.length);

        // 🔥 SAFE MATCH CHECK
        const isUser1 = String(match.user1._id) === String(userId);

        // 🔥 FINAL FIX (userid ✅)
       const myAnswers = answers.filter(
  a => a.userId && a.userId.equals
    ? a.userId.equals(userId)
    : String(a.userId) === String(userId)
);

const theirAnswers = answers.filter(
  a => a.userId && a.userId.equals
    ? !a.userId.equals(userId)
    : String(a.userId) !== String(userId)
);

        console.log("MY:", myAnswers.length);
        console.log("THEIR:", theirAnswers.length);
        console.log("======================");

        return {
          ...match.toObject(),

          otherUser: isUser1 ? match.user2 : match.user1,

          myAnswers,
          theirAnswers
        };
      })
    );

    console.log("💖 MATCHES FINAL:", enrichedMatches.length);

    res.json(enrichedMatches);

  } catch (error) {
    console.log("❌ GET MATCH ERROR:", error.message);
    res.status(500).json({ error: error.message });
  }
};
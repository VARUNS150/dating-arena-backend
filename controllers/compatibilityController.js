const Answer = require("../models/Answer");
const Match = require("../models/Match");
const mongoose = require("mongoose");

exports.calculateCompatibility = async (req, res) => {

  try {

    const { roomId } = req.params;

    const roomObjId = new mongoose.Types.ObjectId(roomId);

    // 🔥 GET ALL ANSWERS OF ROOM
    const answers = await Answer.find({ roomId: roomObjId });

    if (!answers.length) {
      return res.json([]);
    }

    // 🔥 GROUP ANSWERS BY USER
    const userAnswers = {};

    answers.forEach(ans => {

      const uid = ans.userId.toString();

      if (!userAnswers[uid]) {
        userAnswers[uid] = [];
      }

      userAnswers[uid].push(ans.answer);

    });

    const users = Object.keys(userAnswers);

    const matches = [];

    // 🔥 COMPARE EVERY USER WITH EVERY USER
    for (let i = 0; i < users.length; i++) {

      for (let j = i + 1; j < users.length; j++) {

        let score = 0;

        const answers1 = userAnswers[users[i]];
        const answers2 = userAnswers[users[j]];

        const total = Math.min(answers1.length, answers2.length);

        if (total === 0) continue; // ⚠️ prevent divide by zero

        for (let k = 0; k < total; k++) {

          if (answers1[k] === answers2[k]) {
            score++;
          }

        }

        const percentage = (score / total) * 100;

        console.log("⚖️ COMPARE:", users[i], users[j], "=>", percentage);

        // 🔥 MATCH CONDITION
        if (percentage >= 70) {

          const user1 = new mongoose.Types.ObjectId(users[i]);
          const user2 = new mongoose.Types.ObjectId(users[j]);

          // 🔥 CHECK EXISTING MATCH
          const existing = await Match.findOne({
            $or: [
              { user1, user2, roomId: roomObjId },
              { user1: user2, user2: user1, roomId: roomObjId }
            ]
          });

          if (!existing) {

            const newMatch = new Match({
              user1,
              user2,
              compatibility: percentage,
              roomId: roomObjId
            });

            await newMatch.save();

            console.log("🔥 MATCH SAVED:", user1.toString(), user2.toString());

            matches.push(newMatch);

          } else {
            console.log("⚠️ MATCH ALREADY EXISTS");
          }

        }

      }

    }

    console.log("💖 TOTAL MATCHES CREATED:", matches.length);

    res.json(matches);

  } catch (error) {

    console.log("❌ COMPATIBILITY ERROR:", error.message);

    res.status(500).json({ error: error.message });

  }

};
const Answer = require("../models/Answer");
const Match = require("../models/Match");
const mongoose = require("mongoose");

exports.calculateCompatibility = async (req, res) => {

  try {

    const { roomId } = req.params;

    console.log("ROOM ID:", roomId, typeof roomId);

    // 🔥 FIX: NO ObjectId conversion
    const answers = await Answer.find({ roomId });

    if (!answers.length) {
      return res.json([]);
    }

    const userAnswers = {};

    answers.forEach(ans => {

      const uid = ans.userId.toString();

      if (!userAnswers[uid]) {
        userAnswers[uid] = [];
      }

      userAnswers[uid].push(ans.answer);

    });

    const users = Object.keys(userAnswers);

    console.log("USERS:", users);

    const matches = [];

    for (let i = 0; i < users.length; i++) {

      for (let j = i + 1; j < users.length; j++) {

        let score = 0;

        const answers1 = userAnswers[users[i]];
        const answers2 = userAnswers[users[j]];

        const total = Math.min(answers1.length, answers2.length);

        if (total === 0) continue;

        for (let k = 0; k < total; k++) {

          if (answers1[k] === answers2[k]) {
            score++;
          }

        }

        const percentage = (score / total) * 100;

        console.log("⚖️ COMPARE:", users[i], users[j], percentage);

        if (percentage >= 70) {

          // 🔥 sort users (duplicate fix)
          const sorted = [users[i], users[j]].sort();

          const user1 = new mongoose.Types.ObjectId(sorted[0]);
          const user2 = new mongoose.Types.ObjectId(sorted[1]);

          const existing = await Match.findOne({
            user1,
            user2,
            roomId
          });

          if (!existing) {

            const newMatch = new Match({
              user1,
              user2,
              compatibility: percentage,
              roomId   // 🔥 string
            });

            await newMatch.save();

            console.log("🔥 MATCH SAVED:", newMatch._id);

            matches.push(newMatch);

          } else {
            console.log("⚠️ MATCH EXISTS");
          }

        }

      }

    }

    console.log("💖 TOTAL MATCHES:", matches.length);

    res.json(matches);

  } catch (error) {

    console.log("❌ ERROR:", error.message);

    res.status(500).json({ error: error.message });

  }

};
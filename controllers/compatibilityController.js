const Answer = require("../models/Answer");
const Match = require("../models/Match");

exports.calculateCompatibility = async (req, res) => {

  try {

    const { roomId } = req.params;

    const answers = await Answer.find({ roomId });

    const userAnswers = {};

    answers.forEach(ans => {

      if (!userAnswers[ans.userId]) {
        userAnswers[ans.userId] = [];
      }

      userAnswers[ans.userId].push(ans.answer);

    });

    const users = Object.keys(userAnswers);

    const matches = [];

    for (let i = 0; i < users.length; i++) {

      for (let j = i + 1; j < users.length; j++) {

        let score = 0;

        const answers1 = userAnswers[users[i]];
        const answers2 = userAnswers[users[j]];

        const total = Math.min(answers1.length, answers2.length);

        for (let k = 0; k < total; k++) {

          if (answers1[k] === answers2[k]) {
            score++;
          }

        }

        const percentage = (score / total) * 100;

        if (percentage >= 70) {

  const existing = await Match.findOne({
    $or: [
      { user1: users[i], user2: users[j] },
      { user1: users[j], user2: users[i] }
    ],
    roomId
  });

  if (!existing) {

    const newMatch = new Match({
      user1: users[i],
      user2: users[j],
      compatibility: percentage,
      roomId
    });

    await newMatch.save();
    matches.push(newMatch);

  }

}

      }

    }

    res.json(matches);

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

};
const ArenaRoom = require("../models/ArenaRoom");
const Answer = require("../models/Answer");

exports.joinArena = async (req, res) => {
  try {

    const userId = req.user.id;

    // find waiting room
    let room = await ArenaRoom.findOne({ status: "waiting" });

    // create new room if none exists
    if (!room) {

      room = new ArenaRoom({
        players: [userId],
        status: "waiting"
      });

      await room.save();

      return res.json({
        message: "New room created",
        roomId: room._id,
        room
      });

    }

    // avoid duplicate player
    if (!room.players.includes(userId)) {
      room.players.push(userId);
    }

    // if room full start game
    if (room.players.length >= 4) {
      room.status = "active";
    }

    await room.save();

    res.json({
      message: "Joined room",
      roomId: room._id,
      room
    });

  } catch (error) {

    res.status(500).json({ error: error.message });

  }
};



exports.submitAnswer = async (req, res) => {

  try {

    const userId = req.user.id;

    const { roomId, questionId, answer } = req.body;

    const newAnswer = new Answer({
      roomId,
      userId,
      questionId,
      answer
    });

    await newAnswer.save();

    res.json({
      message: "Answer submitted",
      newAnswer
    });

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

};
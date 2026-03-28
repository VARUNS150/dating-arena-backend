const ArenaRoom = require("../models/ArenaRoom");
const Answer = require("../models/Answer");

exports.joinArena = async (req, res) => {
  try {

    const userId = req.user.id;

    // find waiting room (oldest one)
    let room = await ArenaRoom.findOne({ status: "waiting" }).sort({ createdAt: 1 });

    // create new room if none exists
    if (!room) {

      room = new ArenaRoom({
        players: [userId],
        status: "waiting"
      });

      await room.save();

      return res.json({
        message: "New room created",
        roomId: room._id.toString(),   // 🔥 FIX
        room
      });

    }

    // avoid duplicate player
    if (!room.players.includes(userId)) {
      room.players.push(userId);
    }

    // 🔥 IMPORTANT: testing ke liye 2 users pe hi room lock
    if (room.players.length >= 2) {
      room.status = "active";
    }

    await room.save();

    console.log("ROOM ASSIGNED:", room._id.toString());

    res.json({
      message: "Joined room",
      roomId: room._id.toString(),   // 🔥 FIX (MOST IMPORTANT)
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
      roomId: String(roomId),   // 🔥 FIX (MOST IMPORTANT)
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
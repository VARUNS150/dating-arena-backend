const mongoose = require("mongoose");
const Like = require("../models/Like");
const Match = require("../models/Match");
const User = require("../models/User"); // 🔥 ADD THIS

exports.sendLike = async (req, res) => {
  try {

    const { toUser, roomId } = req.body;
    const fromUser = req.user.id;

    const fromId = new mongoose.Types.ObjectId(fromUser);
    const toId = new mongoose.Types.ObjectId(toUser);
    const roomObjId = new mongoose.Types.ObjectId(roomId);

    const io = req.app.get("io");
    const onlineUsers = req.app.get("onlineUsers");

    /* 🔥 PREVENT DUPLICATE LIKE */
    const alreadyLiked = await Like.findOne({
      fromUser: fromId,
      toUser: toId,
      roomId: roomObjId
    });

    if (alreadyLiked) {
      return res.json({ message: "Already liked" });
    }

    /* ✅ SAVE LIKE */
    await Like.create({
      fromUser: fromId,
      toUser: toId,
      roomId: roomObjId
    });

    console.log("❤️ Like stored:", fromUser, "→", toUser);

    /* 🔥 CHECK REVERSE LIKE */
    const reverseLike = await Like.findOne({
      fromUser: toId,
      toUser: fromId,
      roomId: roomObjId
    });

    if (reverseLike) {

      console.log("💥 MATCH FOUND");

      try {

        const match = await Match.create({
          user1: fromId,
          user2: toId,
          roomId: roomObjId,
          compatibility: 100
        });

        console.log("🔥 MATCH CREATED:", match._id);

        /* 🔥 GET USER DATA */
        const sender = await User.findById(fromId).select("name profilePic");
        const receiver = await User.findById(toId).select("name profilePic");

        /* 🔥 SOCKETS */
        const senderSocket = onlineUsers[fromUser];
        const receiverSocket = onlineUsers[toUser];

        /* 🔥 SEND TO SENDER */
        if (senderSocket) {
          io.to(senderSocket).emit("match_found", {
            userId: receiver._id,
            name: receiver.name,
            roomId: roomId,
            profilePic: receiver.profilePic
          });
        }

        /* 🔥 SEND TO RECEIVER */
        if (receiverSocket) {
          io.to(receiverSocket).emit("match_found", {
            userId: sender._id,
            name: sender.name,
            roomId: roomId,
            profilePic: sender.profilePic
          });
        }

        return res.json({
          message: "🔥 It's a match!",
          match
        });

      } catch (err) {

        if (err.code === 11000) {

          console.log("⚠️ Duplicate match blocked");

          return res.json({ message: "Already matched" });
        }

        throw err;
      }
    }

    res.json({ message: "Like sent" });

  } catch (err) {
    console.log("❌ Like error:", err.message);
    res.status(500).json({ error: err.message });
  }
};
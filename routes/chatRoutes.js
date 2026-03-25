const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const authMiddleware = require("../middleware/authMiddleware");
const Message = require("../models/Message");

/* 🔥 GET MESSAGES BY ROOM */
router.get("/:roomId", authMiddleware, async (req, res) => {
  try {

    const { roomId } = req.params;

    console.log("📜 FETCHING MESSAGES:", roomId);

    const messages = await Message.find({
      roomId: new mongoose.Types.ObjectId(roomId)
    }).sort({ createdAt: 1 });

    res.json(messages);

  } catch (err) {
    console.log("❌ CHAT ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
const Message = require("../models/Message");


/* ---------------- SEND MESSAGE ---------------- */

exports.sendMessage = async (req, res) => {

  try {

    const senderId = req.user.id;

    const { roomId, text } = req.body;

    const message = new Message({
      roomId: roomId,
      senderId: senderId,
      text: text,
      time: new Date().toLocaleTimeString()
    });

    await message.save();

    res.json({
      message: "Message sent",
      data: message
    });

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

};


/* ---------------- GET CHAT HISTORY ---------------- */

exports.getChatHistory = async (req, res) => {

  try {

    const { roomId } = req.params;

    const messages = await Message.find({ roomId })
      .populate("senderId", "name")
      .sort({ createdAt: 1 });

    res.json(messages);

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

};


/* ---------------- GET USER CONVERSATIONS ---------------- */

exports.getConversations = async (req, res) => {
  try {

    const userId = req.user.id;

    const conversations = await Message.aggregate([

      {
        $match: {
          $or: [
            { senderId: userId },
            { receiverId: userId } // 🔥 ADD THIS
          ]
        }
      },

      {
        $sort: { createdAt: -1 }
      },

      {
        $group: {
          _id: "$roomId",
          lastMessage: { $first: "$text" },
          time: { $first: "$createdAt" }
        }
      }

    ]);

    res.json(conversations);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
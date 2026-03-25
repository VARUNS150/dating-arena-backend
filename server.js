const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const Message = require("./models/Message");

/* 🔥 ROUTES IMPORT */
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const arenaRoutes = require("./routes/arenaRoutes");
const questionRoutes = require("./routes/questionRoutes");
const compatibilityRoutes = require("./routes/compatibilityRoutes");
const matchRoutes = require("./routes/matchRoutes");
const chatRoutes = require("./routes/chatRoutes");
const answerRoutes = require("./routes/answerRoutes");
const likeRoutes = require("./routes/likeRoutes");

const app = express();

app.use(cors());
app.use(express.json());

/* 🔥 ALL ROUTES MOUNT */
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/arena", arenaRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/compatibility", compatibilityRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/answers", answerRoutes);
app.use("/api/likes", likeRoutes);

/* ---------------- DATABASE ---------------- */

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("MongoDB Error:", err));

/* 🔥 INDEX FIX */
mongoose.connection.once("open", async () => {
  try {
    console.log("📦 Syncing indexes...");

    await mongoose.connection.db.collection("matches").createIndex(
      { user1: 1, user2: 1, roomId: 1 },
      { unique: true }
    );

    await mongoose.connection.db.collection("likes").createIndex(
      { fromUser: 1, toUser: 1, roomId: 1 },
      { unique: true }
    );

    console.log("✅ Indexes synced");

  } catch (err) {
    console.log("❌ Index error:", err.message);
  }
});

/* ---------------- SOCKET ---------------- */

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

/* 🔥 ADD THIS (VERY IMPORTANT) */
const onlineUsers = {};
app.set("io", io);
app.set("onlineUsers", onlineUsers);

io.on("connection", (socket) => {

  console.log("⚡ Socket connected:", socket.id);

  /* 🔥 REGISTER USER */
  socket.on("register", (userId) => {
    onlineUsers[userId] = socket.id;
    console.log("👤 Registered:", userId, socket.id);
  });

  /* JOIN ROOM */
  socket.on("join_room", (roomId) => {
    socket.join(roomId);
  });

  /* SEND MESSAGE */
  socket.on("send_message", async (data) => {
    try {

      const newMessage = new Message({
        roomId: new mongoose.Types.ObjectId(data.roomId),
        senderId: new mongoose.Types.ObjectId(data.senderId),
        receiverId: new mongoose.Types.ObjectId(data.receiverId),
        text: data.text,
        time: data.time
      });

      await newMessage.save();

      io.to(data.roomId).emit("receive_message", {
        _id: newMessage._id.toString(),
        roomId: newMessage.roomId.toString(),
        senderId: newMessage.senderId.toString(),
        receiverId: newMessage.receiverId.toString(),
        text: newMessage.text,
        time: newMessage.time
      });

    } catch (err) {
      console.log("❌ Socket error:", err);
    }
  });

  /* 🔥 CLEANUP ON DISCONNECT */
  socket.on("disconnect", () => {
    console.log("❌ Disconnected:", socket.id);

    for (let userId in onlineUsers) {
      if (onlineUsers[userId] === socket.id) {
        delete onlineUsers[userId];
        break;
      }
    }
  });

});

server.listen(5000, "0.0.0.0", () => {
  console.log("🚀 Server running on port 5000");
});
const mongoose = require("mongoose");

const ArenaRoomSchema = new mongoose.Schema({

  players: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],

  status: {
    type: String,
    default: "waiting"
  }

}, { timestamps: true });

module.exports = mongoose.model("ArenaRoom", ArenaRoomSchema);
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    lowercase:true,
    trim:true,
    unique: true
  },

  profilePic: {
  type: String,
  default: ""
},
bio: {
  type: String,
  default: ""
},
interests: {
  type: [String],
  default: []
},
  password: {
    type: String,
    required: true
  },
  age: Number,
  gender: String,
  location: String,
  bio: String,
  interests: [String],
  photos: [String],
  location: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("User", UserSchema);
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User");

// 🔥 NEW IMPORTS
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

/* ---------------- MULTER SETUP ---------------- */

const storage = multer.memoryStorage();
const upload = multer({ storage });

/* ---------------- GET USER PROFILE ---------------- */

router.get("/profile", authMiddleware, async (req, res) => {
  try {

    const user = await User.findById(req.user.id).select("-password");

    res.json(user);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ---------------- UPDATE USER PROFILE ---------------- */

router.put("/update-profile", authMiddleware, async (req, res) => {
  try {

    const { age, gender, bio, interests, location } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        age,
        gender,
        bio,
        interests,
        location
      },
      { new: true } // 🔥 FIXED (better than returnDocument)
    ).select("-password");

    res.json(updatedUser);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ---------------- 🔥 UPLOAD PROFILE IMAGE ---------------- */

router.post(
  "/upload-profile-pic",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // 🔥 Upload to Cloudinary using stream
      const stream = cloudinary.uploader.upload_stream(
        { folder: "profiles" },
        async (error, result) => {

          if (error) {
            console.log("❌ Cloudinary Error:", error);
            return res.status(500).json({ error });
          }

          // 🔥 Save URL in DB
          const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { profilePic: result.secure_url },
            { new: true }
          ).select("-password");

          res.json(updatedUser);
        }
      );

      streamifier.createReadStream(req.file.buffer).pipe(stream);

    } catch (error) {
      console.log("❌ Upload Error:", error.message);
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const answerController = require("../controllers/answerController");

router.post("/", authMiddleware, answerController.saveAnswer);

module.exports = router;
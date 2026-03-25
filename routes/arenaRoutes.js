const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const arenaController = require("../controllers/arenaController");

router.post("/join", authMiddleware, arenaController.joinArena);
router.post("/answer", authMiddleware, arenaController.submitAnswer);

module.exports = router;
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const compatibilityController = require("../controllers/compatibilityController");

router.get("/:roomId", authMiddleware, compatibilityController.calculateCompatibility);

module.exports = router;
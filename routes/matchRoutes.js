const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const matchController = require("../controllers/matchController");

/* ---------------- GET ALL MATCHES ---------------- */

router.get("/", authMiddleware, matchController.getMatches);

/* ---------------- CREATE MATCH ---------------- */

router.post("/", authMiddleware, matchController.createMatch);

/* ---------------- DEBUG ROUTE (OPTIONAL) ---------------- */
// 👉 browser/postman me test karne ke liye
router.get("/test", (req, res) => {
  res.send("Match routes working ✅");
});

module.exports = router;
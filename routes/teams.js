const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const CollectionTeam = require("../models/CollectionTeam");

router.get("/", protect, async (req, res) => {
  try {
    const teams = await CollectionTeam.find();
    res.json(teams);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch teams" });
  }
});

module.exports = router;
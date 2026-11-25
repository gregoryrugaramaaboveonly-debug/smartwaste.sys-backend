const express = require("express");
const router = express.Router();
const { protect, requireRole } = require("../middleware/authMiddleware");
const CollectionPoint = require("../models/CollectionPoint");

// 1. PUBLIC ROUTE (For the Citizen Map)
router.get("/public", async (req, res) => {
  try {
    const points = await CollectionPoint.find();
    res.json(points);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch points" });
  }
});

// 2. ADMIN ROUTE (For the Admin Dashboard)
router.get("/", protect, async (req, res) => {
  try {
    const points = await CollectionPoint.find();
    res.json(points);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch points" });
  }
});

// 3. CREATE (Admin only) - NOW ACCEPTS GPS COORDINATES
router.post("/", protect, requireRole("admin"), async (req, res) => {
  try {
    const { name, district, area, waste_type, capacity_kg, current_status, lat, lng } = req.body;
    
    const count = await CollectionPoint.countDocuments();
    const newId = `PT00${count + 1}`;

    const newPoint = new CollectionPoint({
      _id: newId,
      name,
      district,
      area,
      waste_type,
      capacity_kg,
      current_status,
      // Use the lat and lng sent from the frontend, or default to Kampala center if missing
      location: { 
        type: "Point", 
        coordinates: [
          parseFloat(lng) || 32.5825, 
          parseFloat(lat) || 0.3476
        ] 
      }
    });

    await newPoint.save();
    res.status(201).json(newPoint);
  } catch (err) {
    res.status(500).json({ error: "Failed to create point" });
  }
});

module.exports = router;
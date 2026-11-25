const express = require("express");
const router = express.Router();
const { protect, requireRole } = require("../middleware/authMiddleware");
const WasteReport = require("../models/WasteReport");

// --- PUBLIC ROUTES (No login required, for the Citizen Map) ---

// 1. Fetch reports for the public map (Hides anonymous names)
router.get("/public", async (req, res) => {
  try {
    const reports = await WasteReport.find();
    const publicReports = reports.map(r => {
      const report = r.toObject();
      if (report.is_anonymous) {
        report.reporter_name = "Anonymous Citizen";
      }
      return report;
    });
    res.json(publicReports);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch public reports" });
  }
});

// 2. Public submission (Citizens reporting issues)
router.post("/public", async (req, res) => {
  try {
    const { point_id, issue_type, description, reporter_name, is_anonymous } = req.body;
    
    const count = await WasteReport.countDocuments();
    const newId = `RPT${100 + count + 1}`;
    
    const newReport = new WasteReport({
      _id: newId,
      point_id,
      issue_type,
      description,
      reporter_name: is_anonymous ? "Anonymous Citizen" : (reporter_name || "Unknown Citizen"),
      is_anonymous: is_anonymous || false,
      reported_at: new Date(),
      priority: "Medium",
      status: "Pending",
      upvotes: 0
    });

    await newReport.save();
    res.status(201).json(newReport);
  } catch (err) {
    res.status(500).json({ error: "Failed to submit report" });
  }
});

// 3. Public Upvote ("Me Too" Button)
router.patch("/public/:id/upvote", async (req, res) => {
  try {
    const report = await WasteReport.findById(req.params.id);
    if (!report) return res.status(404).json({ error: "Report not found" });
    
    report.upvotes = (report.upvotes || 0) + 1;
    await report.save();
    
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: "Failed to upvote" });
  }
});

// --- ADMIN ROUTES (Login required) ---

// GET for Admin Dashboard (Sees real names)
router.get("/", protect, async (req, res) => {
  try {
    const reports = await WasteReport.find();
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

// Admin Create
router.post("/", protect, requireRole("admin"), async (req, res) => {
  try {
    const count = await WasteReport.countDocuments();
    const newId = `RPT${100 + count + 1}`;
    
    const newReport = new WasteReport({
      _id: newId,
      ...req.body,
      reported_at: new Date(),
      status: "Pending",
      upvotes: 0
    });
    await newReport.save();
    res.status(201).json(newReport);
  } catch (err) {
    res.status(500).json({ error: "Failed to create report" });
  }
});

// Admin Assign/Re-Assign
router.patch("/:id/assign", protect, requireRole("admin", "dispatcher"), async (req, res) => {
  try {
    const { team_id } = req.body;
    const updatedReport = await WasteReport.findByIdAndUpdate(
      req.params.id, 
      { status: "Assigned", assigned_team_id: team_id },
      { new: true }
    );
    res.json(updatedReport);
  } catch (err) {
    res.status(500).json({ error: "Failed to assign team" });
  }
});

// Admin Delete
router.delete("/:id", protect, requireRole("admin"), async (req, res) => {
  try {
    await WasteReport.findByIdAndDelete(req.params.id);
    res.json({ message: "Report deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete report" });
  }
});

module.exports = router;
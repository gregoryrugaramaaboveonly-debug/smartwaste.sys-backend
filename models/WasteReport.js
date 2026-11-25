const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  _id: String,
  point_id: String,
  reporter_name: String,
  issue_type: String,
  description: String,
  reported_at: Date,
  priority: String,
  status: String,
  assigned_team_id: String,
  is_anonymous: { type: Boolean, default: false },
  upvotes: { type: Number, default: 0 }
});

module.exports = mongoose.model("WasteReport", reportSchema, "waste_reports");
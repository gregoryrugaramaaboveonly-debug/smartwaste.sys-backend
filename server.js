require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middleware (Only allowing your active Vercel link)
app.use(cors({
  origin: "https://smartwaste-sys-frontend.vercel.app"
}));
app.use(express.json());

// Import routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/reports", require("./routes/reports"));
app.use("/api/points", require("./routes/points"));
app.use("/api/teams", require("./routes/teams"));
app.use("/api/schedules", require("./routes/schedules"));

// Test route
app.get("/", (req, res) => {
  res.json({ message: "SmartWaste API is running!" });
});

// Connect to MongoDB and start the server
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB (SmartWasteDB)");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
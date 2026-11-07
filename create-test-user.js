require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const hash = await bcrypt.hash("password123", 10);
  await User.create({
    _id: "USR001",
    name: "System Admin",
    email: "admin@smartwaste.ug",
    password_hash: hash,
    role: "admin"
  });
  console.log(" Test Admin user created!");
  process.exit();
});
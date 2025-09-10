
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Team = require("../Schemas/Team.js");
const Admin = require("../Schemas/Admin.js");
require('dotenv').config();

const SECRET = process.env.JWT_SECRET || "ALGOMANIA3_SECRET_KEY";

router.post("/login", async (req, res) => {
  try {
    const { name, password, role } = req.body;

    let user;
    if (role === "admin") {
      user = await Admin.findOne({ name });
    } else if (role === "user") {
      user = await Team.findOne({ teamName:name });
    } else {
      return res.status(400).json({ message: "Invalid role" });
    }

    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: user._id, role:role },
      SECRET,
      { expiresIn: "30d" }
    );

    res.json({ token, role: role });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

router.post("/admin/signup", async (req, res) => {
  try {
    const { name, password } = req.body;

    // check if already exists
    const existingAdmin = await Admin.findOne({ name });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    // hash password

    const newAdmin = new Admin({
      name,
     password,
    });

    await newAdmin.save();

    res.status(201).json({ message: "Admin created successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;


module.exports = router;
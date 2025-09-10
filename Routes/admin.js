const express = require('express');
const router = express.Router();
const Team = require('../Schemas/Team.js');
const Admin = require('../Schemas/Admin.js');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const SECRET = process.env.JWT_SECRET_KEY | "ALGOMANIA3_SECRET_KEY";
//For admins to add new teams
router.post("/add_new/team", async (req, res) => {
  try {
    const { teamName, teamLeader, teamLeaderMail, password, members } = req.body;
    if (!teamName || !teamLeader || !teamLeaderMail || !password || !members) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (members.length < 8 || members.length > 10) {
      return res.status(400).json({ message: "Team must have between 8 and 10 members" });
    }
    const existingTeam = await Team.findOne({ teamName });
    if (existingTeam) {
      return res.status(400).json({ message: "Team name already exists" });
    }
    const newTeam = new Team({
      teamName,
      teamLeader,
      teamLeaderMail,
      password,
      members
    });

    await newTeam.save();
    res.status(201).json({ message: "Team created successfully" });
  } catch (err) {
    console.error("❌ Error creating team:", err);
    res.status(500).json({ message: "Error creating team", error: err.message });
  }
});

router.get("/all_teams", async (req, res) => {
  try {
    const teams = await Team.find({}, '-password'); // Exclude password field
    res.json(teams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  } });

router.get("/team/:teamName", async (req, res) => {
  try {
    const { teamName } = req.params;
    const team = await Team.findOne({ teamName });

    if (!team) return res.status(404).json({ message: "Team not found" });

    res.json(team);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
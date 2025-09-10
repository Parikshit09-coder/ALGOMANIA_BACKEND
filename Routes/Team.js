const express = require('express');
const router = express.Router();
const Team = require('../Schemas/Team.js');

require('dotenv').config();
const SECRET = process.env.JWT_SECRET_KEY | "ALGOMANIA3_SECRET_KEY";

router.get("/topteams", async (req, res) => {
  try {
    const teams = await Team.find({}, '-password'); 
    res.json(teams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  } });



router.get("/myTeam", async (req, res) => {
  try {
    const teamId = req.user.id; // JWT contains the team _id
    const team = await Team.findById(teamId);

    if (!team) return res.status(404).json({ message: "Team not found" ,teamId});

    res.json(team);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});




  
module.exports = router;
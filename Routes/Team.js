const express = require('express');
const router = express.Router();
const Team = require('../Schemas/Team.js');
const { getMemberProfile } = require("../Utils/memberdata.js");
const Notice = require("../Schemas/Notes.js");

require('dotenv').config();
const SECRET = process.env.JWT_SECRET_KEY | "ALGOMANIA3_SECRET_KEY";

router.get("/topteams", async (req, res) => {
  try {
    // Fetch all teams, exclude password
    const teams = await Team.find({}, "-password");

    // Sort by totalScore (not score field directly, since each team has members)
    const sortedTeams = teams.sort((a, b) => b.totalScore - a.totalScore);

    // Assign ranks and update DB
    const rankedTeams = await Promise.all(
      sortedTeams.map(async (team, index) => {
        team.rank = index + 1;
        await team.save(); // 👈 persists rank in DB
        return team.toObject();
      })
    );

    res.json(rankedTeams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


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
router.get("/view/notices", async (req, res) => {
  try {
    const notices = await Notice.find().sort({ createdAt: -1 });
    res.json({ notices });
  } catch (err) {
    console.error("Error fetching notices:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:teamName/member/:userName", async (req, res) => {
  try {
    const { userName } = req.params;
    const { startDate, endDate } = req.query; 

    if (!startDate || !endDate) {
      return res.status(400).json({ message: "startDate and endDate are required" });
    }

    const memberData = await getMemberProfile(userName, new Date(startDate), new Date(endDate));

    res.json({
      message: `✅ Member data fetched: ${userName}`,
      member: memberData,
    });
  } catch (err) {
    console.error("❌ Error fetching member data:", err);
    res.status(500).json({ message: "Error fetching member data" });
  }
});
  
module.exports = router;
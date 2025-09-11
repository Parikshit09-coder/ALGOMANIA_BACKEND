
const express = require('express');
const router = express.Router();
const Team = require('../Schemas/Team.js');
require('dotenv').config();
const { calculateMemberScore } = require("../Utils/leetcode.js");
const { getMemberProfile } = require("../Utils/memberdata.js");


const SECRET = process.env.JWT_SECRET_KEY | "ALGOMANIA3_SECRET_KEY";
const Notice = require("../Schemas/Notes.js");

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

// Update scores for a team in a date range
router.get("/update/score/:teamName", async (req, res) => {
  try {
    const { teamName } = req.params;
    const { startDate, endDate } = req.query; // user provides dates in query params

    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Please provide startDate and endDate" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const team = await Team.findOne({ teamName });
    if (!team) return res.status(404).json({ message: "Team not found" });

    let totalScore = 0;

    for (let member of team.members) {
      const score = await calculateMemberScore(member, start, end);
      member.score = score;
      totalScore += score;
    }

    team.totalScore = totalScore;
    await team.save();

    res.json({
      message: `✅ Scores updated for team: ${teamName}`,
      startDate,
      endDate,
      team,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating team score", error: err.message });
  }
});

router.get("/:teamName/member/:userName", async (req, res) => {
  try {
    const { userName } = req.params;
    const { startDate, endDate } = req.query; // ✅ dates from query params

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


router.post("/add_notice", async (req, res) => {
  try {
    const { title, message, startDate, endDate } = req.body;

    if (!title || !message || !startDate || !endDate) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newNotice = new Notice({
      title,
      message,
      startDate,
      endDate,
    });

    await newNotice.save();

    res.status(201).json({
      message: "Notice created successfully",
      notice: newNotice,
    });
  } catch (err) {
    console.error("Error creating notice:", err);
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
// DELETE a notice by ID
router.delete("/delete_notice/:id", async (req, res) => {
  try {
    const noticeId = req.params.id;
    if (!noticeId) {
      return res.status(400).json({ message: "Notice ID is required" });
    }

    const notice = await Notice.findById(noticeId);
    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }

    await Notice.findByIdAndDelete(noticeId);
    res.status(200).json({ message: "Notice deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
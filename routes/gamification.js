const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const {
  getGamificationDashboard,
  spinWheel,
  getMissions,
  claimMissionReward,
  getLeaderboard,
  getVipStatus
} = require('../controllers/gamification');

// Gamification Dashboard & Profile
router.get('/gamification/dashboard', authMiddleware, getGamificationDashboard);

// Daily Spin
router.post('/gamification/spin', authMiddleware, spinWheel);

// Missions
router.get('/gamification/missions', authMiddleware, getMissions);
router.post('/gamification/missions/:missionProgressId/claim', authMiddleware, claimMissionReward);

// Leaderboard
router.get('/gamification/leaderboard', authMiddleware, getLeaderboard);

// VIP Status
router.get('/gamification/vip-status', authMiddleware, getVipStatus);

module.exports = router;

'use strict';

const express = require('express');
const { authMiddleware } = require('../../middleware/auth');
const {
  LevelConfig,
  Achievement,
  UserGamification,
  SpinHistory,
} = require('../../model/gamification');
const User = require('../../model/user');
const { createGamificationService } = require('./gamification.service');
const { createGamificationController } = require('./gamification.controller');

const router = express.Router();

// Wire up the dependency graph
const service = createGamificationService({
  LevelConfig,
  Achievement,
  UserGamification,
  SpinHistory,
  User,
});

const {
  getLevels,
  getAchievements,
  getSpinHistory,
  getReferrals,
} = createGamificationController({ service });

// ─── NEW GAMIFICATION ROUTES ──────────────────────────────────────────────────

// Levels ladder — no auth needed, publicly visible progression map
router.get('/gamification/levels', getLevels);

// User-specific routes — auth required
router.get('/gamification/achievements', authMiddleware, getAchievements);
router.get('/gamification/spin/history',  authMiddleware, getSpinHistory);
router.get('/gamification/referrals',     authMiddleware, getReferrals);

module.exports = router;

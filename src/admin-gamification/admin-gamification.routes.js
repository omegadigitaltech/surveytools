'use strict';

const express = require('express');
const { authMiddleware, adminMiddleware } = require('../../middleware/auth');
const {
  Achievement,
  LevelConfig,
  VIPTierConfig,
  BonusEvent,
} = require('../../model/gamification');
const { createAdminGamificationService } = require('./admin-gamification.service');
const { createAdminGamificationController } = require('./admin-gamification.controller');

const router = express.Router();

// All admin routes require auth + admin role
const adminAuth = [authMiddleware, adminMiddleware];

// Wire up the dependency graph
const service = createAdminGamificationService({
  Achievement,
  LevelConfig,
  VIPTierConfig,
  BonusEvent,
});

const {
  createAchievement,
  getLevels,
  getVipTiers,
  createBonusEvent,
  getBonusEvents,
} = createAdminGamificationController({ service });

// ─── ADMIN GAMIFICATION ROUTES ────────────────────────────────────────────────

// Achievements
router.post('/admin/gamification/achievements', adminAuth, createAchievement);

// Levels (GET - list was missing; POST already exists in legacy adminGamification.js)
router.get('/admin/gamification/levels', adminAuth, getLevels);

// VIP Tiers (GET - list was missing; POST already exists in legacy adminGamification.js)
router.get('/admin/gamification/vip', adminAuth, getVipTiers);

// Bonus Events (fully new - no legacy implementation exists)
router.post('/admin/gamification/bonus-events', adminAuth, createBonusEvent);
router.get('/admin/gamification/bonus-events',  adminAuth, getBonusEvents);

module.exports = router;

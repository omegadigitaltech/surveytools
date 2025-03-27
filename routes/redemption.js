const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { withTransaction, transactionHandler } = require('../middleware/transaction');
const {
  getDataPlans,
  redeemAirtime,
  redeemData,
  getRedemptionHistory
} = require('../controllers/redemption');

// Get all available data plans
router.get('/redemption/plans', authMiddleware, getDataPlans);

// Redeem points for airtime - apply transaction middleware
router.post('/redemption/airtime', authMiddleware, withTransaction, redeemAirtime);

// Redeem points for data - apply transaction middleware
router.post('/redemption/data', authMiddleware, withTransaction, redeemData);

// Get redemption history
router.get('/redemption/history', authMiddleware, getRedemptionHistory);

module.exports = router; 
const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const {
  getAllUsers,
  getAllRedemptions,
  getRedemptionStats,
  getUserRedemptionHistory,
  makeUserAdmin,
  markSurveyAsPaid,
  getAllSurveysAdmin,
  unpublishSurvey
} = require('../controllers/admin');

// Middleware chain for admin routes: first auth, then admin check
const adminAuth = [authMiddleware, adminMiddleware];

// Admin user management endpoints
router.get('/admin/users', adminAuth, getAllUsers);
router.patch('/admin/users/:userId/admin', adminAuth, makeUserAdmin);

// Admin survey management endpoints
router.get('/admin/surveys', adminAuth, getAllSurveysAdmin);
router.post('/admin/surveys/:surveyId/mark-paid', adminAuth, markSurveyAsPaid);
router.patch('/admin/surveys/:surveyId/unpublish', adminAuth, unpublishSurvey);

// Admin redemption management endpoints
router.get('/admin/redemptions', adminAuth, getAllRedemptions);
router.get('/admin/redemptions/stats', adminAuth, getRedemptionStats);
router.get('/admin/users/:userId/redemptions', adminAuth, getUserRedemptionHistory);

module.exports = router; 
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { getSurveyOverview, getEngagement, getResponseTrends } = require('../controllers/analytics');
const { generateAiInsights } = require('../controllers/aiAnalytics');

router.get('/surveys/:surveyId/analytics/overview', authMiddleware, getSurveyOverview);
router.get('/analytics/engagement', authMiddleware, getEngagement);
router.get('/surveys/:surveyId/analytics/trends', authMiddleware, getResponseTrends);

// AI Data Analyst Endpoint
router.post('/surveys/:surveyId/analytics/ai-insights', authMiddleware, generateAiInsights);

module.exports = router;

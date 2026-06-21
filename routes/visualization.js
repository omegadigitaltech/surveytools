const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { getVisualizations } = require('../controllers/visualization');

// Fetch survey data processed for specific graph types
// Example: GET /surveys/123/visualizations?graphType=bar&questionId=456
router.get('/surveys/:surveyId/visualizations', authMiddleware, getVisualizations);

module.exports = router;

const express = require('express');
const router = express.Router();
const controller = require('./corporate-dashboard.controller');
const { authMiddleware } = require('../../middleware/auth');
const { attachResearcherTier, requireResearcherTier } = require('../kyc/attach-researcher-tier.middleware');

router.use(authMiddleware);
router.use(attachResearcherTier);
router.use(requireResearcherTier(['Institutional']));

router.get('/corporate/overview', controller.getOverview);
router.get('/corporate/analytics', controller.getAnalytics);
router.get('/corporate/invoice/:id', controller.getInvoice);
router.get('/corporate/export', controller.getExport);

module.exports = router;

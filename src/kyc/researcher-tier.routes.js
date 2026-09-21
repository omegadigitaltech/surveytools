'use strict';

const express = require('express');
const { authMiddleware } = require('../../middleware/auth');
const ResearcherProfile = require('./researcher-profile.model');
const { createResearcherProfileRepo } = require('./researcher-profile.repo');
const { createResearcherTierService } = require('./researcher-tier.service');
const { createResearcherTierController } = require('./researcher-tier.controller');

const router = express.Router();

const researcherProfileRepo = createResearcherProfileRepo({ ResearcherProfile });
const tierService = createResearcherTierService({ researcherProfileRepo });
const { getTier } = createResearcherTierController({ service: tierService });

/**
 * GET /v1/kyc/researcher/tier
 * Returns the resolved tier for the authenticated researcher.
 */
router.get('/researcher/tier', authMiddleware, getTier);

module.exports = router;

'use strict';

const express = require('express');

const ResearcherProfile = require('./researcher-profile.model');
const { createResearcherProfileRepo } = require('./researcher-profile.repo');
const { createResearcherProfileService } = require('./researcher-profile.service');
const { createResearcherProfileController } = require('./researcher-profile.controller');
const { authMiddleware } = require('../../middleware/auth');

const router = express.Router();

const repo = createResearcherProfileRepo({ ResearcherProfile });
const service = createResearcherProfileService({ repo });
const { submitProfile } = createResearcherProfileController({ service });

router.post('/researcher/profile', authMiddleware, submitProfile);

module.exports = router;

'use strict';

const express = require('express');
const { authMiddleware } = require('../../middleware/auth');
const RespondentProfile = require('./respondent-profile.model');
const { createRespondentProfileRepo } = require('./respondent-profile.repo');
const { createRespondentSensitiveLayersService } = require('./respondent-sensitive-layers.service');
const { createRespondentSensitiveLayersController } = require('./respondent-sensitive-layers.controller');

const router = express.Router();

const respondentProfileRepo = createRespondentProfileRepo({ RespondentProfile });
const service = createRespondentSensitiveLayersService({ respondentProfileRepo });
const { submitLayer3, submitLayer4, submitLayer5 } = createRespondentSensitiveLayersController({ service });

router.post('/respondent/layer3', authMiddleware, submitLayer3);
router.post('/respondent/layer4', authMiddleware, submitLayer4);
router.post('/respondent/layer5', authMiddleware, submitLayer5);

module.exports = router;

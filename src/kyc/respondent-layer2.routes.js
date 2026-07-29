'use strict';

const express = require('express');
const { authMiddleware } = require('../../middleware/auth');
const RespondentProfile = require('./respondent-profile.model');
const { createRespondentProfileRepo } = require('./respondent-profile.repo');
const { createRespondentLayer2Service } = require('./respondent-layer2.service');
const { createProgressiveProfileService } = require('./progressive-profile.service');
const { createRespondentLayer2Controller } = require('./respondent-layer2.controller');

const router = express.Router();

const respondentProfileRepo = createRespondentProfileRepo({ RespondentProfile });
const service = createRespondentLayer2Service({ respondentProfileRepo });
const progressiveService = createProgressiveProfileService({ respondentProfileRepo });
const { submitLayer2, getLayerStatus, hookSurveyCompleted } = createRespondentLayer2Controller({ service, progressiveService });

router.post('/respondent/layer2', authMiddleware, submitLayer2);
router.get('/respondent/layer-status', authMiddleware, getLayerStatus);
router.post('/respondent/survey-completed', authMiddleware, hookSurveyCompleted);

module.exports = router;

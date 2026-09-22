'use strict';

const express = require('express');
const { authMiddleware } = require('../../middleware/auth');
const kycConfig = require('../../config/kyc-config');
const RespondentProfile = require('./respondent-profile.model');
const { createRespondentProfileRepo } = require('./respondent-profile.repo');
const { createRespondentSensitiveLayersService } = require('./respondent-sensitive-layers.service');
const { createRespondentSensitiveLayersController } = require('./respondent-sensitive-layers.controller');

// New dependencies for demographic credit
const SurveyLayerCredit = require('../../model/survey-layer-credit');
const DemographicAggregate = require('../../model/demographic-aggregate');
const { createLogger } = require('../../lib/logger');
const { createDemographicCreditService } = require('../corporate-dashboard/demographic-credit.service');
const { Survey } = require('../../model/survey');

const router = express.Router();

const respondentProfileRepo = createRespondentProfileRepo({ RespondentProfile });
const { creditLayerToSurvey } = createDemographicCreditService({ SurveyLayerCredit, DemographicAggregate, createLogger });

const service = createRespondentSensitiveLayersService({ 
  respondentProfileRepo, 
  kycConfig,
  creditLayerToSurvey,
  Survey
});
const { submitLayer3, submitLayer4, submitLayer5 } = createRespondentSensitiveLayersController({ service });

router.post('/respondent/layer3', authMiddleware, submitLayer3);
router.post('/respondent/layer4', authMiddleware, submitLayer4);
router.post('/respondent/layer5', authMiddleware, submitLayer5);

module.exports = router;

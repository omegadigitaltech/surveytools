'use strict';

const express = require('express');
const { authMiddleware } = require('../../middleware/auth');
const RespondentProfile = require('./respondent-profile.model');
const { createRespondentProfileRepo } = require('./respondent-profile.repo');
const { createRespondentLayer1Service } = require('./respondent-layer1.service');
const { createRespondentLayer1Controller } = require('./respondent-layer1.controller');

const router = express.Router();

const respondentProfileRepo = createRespondentProfileRepo({ RespondentProfile });
const service = createRespondentLayer1Service({ respondentProfileRepo });
const { submitLayer1 } = createRespondentLayer1Controller({ service });

router.post('/respondent/layer1', authMiddleware, submitLayer1);

module.exports = router;

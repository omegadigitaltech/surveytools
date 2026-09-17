'use strict';
const express = require('express');
const { authMiddleware } = require('../../middleware/auth');
const ConsentRecord = require('./consent.model');
const { createConsentRepo } = require('./consent.repo');
const { createConsentService } = require('./consent.service');
const { createConsentController } = require('./consent.controller');

const router = express.Router();
const consentRepo = createConsentRepo({ ConsentRecord });
const consentService = createConsentService({ consentRepo });
const consentController = createConsentController({ service: consentService });

router.post('/consent', authMiddleware, consentController.captureConsent);
router.patch('/consent/:scope', authMiddleware, consentController.updateConsent);

module.exports = router;

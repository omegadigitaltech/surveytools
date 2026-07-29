'use strict';
const express = require('express');
const { authMiddleware } = require('../../middleware/auth');
const ConsentRecord = require('./consent.model');
const { createConsentRepo } = require('./consent.repo');
const { createConsentService } = require('./consent.service');
const { createConsentController } = require('./consent.controller');
const { createErasureService } = require('./erasure.service');
const { createErasureController } = require('./erasure.controller');

const router = express.Router();
const consentRepo = createConsentRepo({ ConsentRecord });
const consentService = createConsentService({ consentRepo });
const erasureService = createErasureService();
const consentController = createConsentController({ service: consentService });
const erasureController = createErasureController({ erasureService });

router.post('/consent', authMiddleware, consentController.captureConsent);
router.patch('/consent/:scope', authMiddleware, consentController.updateConsent);
router.delete('/me', authMiddleware, erasureController.erase);

module.exports = router;

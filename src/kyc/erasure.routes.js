'use strict';

const express = require('express');
const { authMiddleware } = require('../../middleware/auth');
const { createErasureService } = require('./erasure.service');
const { createErasureController } = require('./erasure.controller');

const router = express.Router();
const erasureService = createErasureService();
const erasureController = createErasureController({ erasureService });

/**
 * DELETE /v1/kyc/me
 * Erases the authenticated user's KYC data (NDPR right to erasure).
 */
router.delete('/me', authMiddleware, erasureController.erase);

module.exports = router;

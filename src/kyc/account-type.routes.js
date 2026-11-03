'use strict';

const express = require('express');
const User = require('../../model/user');
const ResearcherProfile = require('./researcher-profile.model');
const RespondentProfile = require('./respondent-profile.model');
const { createAccountTypeService } = require('./account-type.service');
const { createAccountTypeController } = require('./account-type.controller');
const { authMiddleware } = require('../../middleware/auth');

const router = express.Router();

const service = createAccountTypeService({
  User,
  ResearcherProfile,
  RespondentProfile,
});
const { handleUpdateAccountType } = createAccountTypeController({ service });

/**
 * PATCH /v1/kyc/account-type
 * Updates userType and submits/upserts researcher or respondent profile in one call.
 */
router.patch('/account-type', authMiddleware, handleUpdateAccountType);

module.exports = router;

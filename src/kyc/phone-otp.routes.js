'use strict';

const express = require('express');
const { authMiddleware } = require('../../middleware/auth');

const kycConfig = require('../../config/kyc-config');
const { createSmsClient } = require('../../lib/sms-client');
const PhoneOtp = require('../../model/phone-otp');
const { createPhoneOtpRepo } = require('./phone-otp.repo');
const { createPhoneOtpService } = require('./phone-otp.service');
const { createPhoneOtpController } = require('./phone-otp.controller');

const router = express.Router();

// Wire up the dependency graph
const smsClient = createSmsClient({
  apiKey: kycConfig.smsProviderApiKey,
  baseUrl: kycConfig.smsProviderBaseUrl,
});
const otpRepo = createPhoneOtpRepo({ PhoneOtp });
const phoneOtpService = createPhoneOtpService({ smsClient, otpRepo, kycConfig });
const { requestOtp, verifyOtp } = createPhoneOtpController({ phoneOtpService });

/**
 * POST /v1/kyc/otp/request
 * Issues a 6-digit OTP to the phone number.
 */
router.post('/otp/request', authMiddleware, requestOtp);

/**
 * POST /v1/kyc/otp/verify
 * Verifies the OTP and updates the User's phoneVerified status.
 */
router.post('/otp/verify', authMiddleware, verifyOtp);

module.exports = router;

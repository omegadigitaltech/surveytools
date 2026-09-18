'use strict';

const express = require('express');
const rateLimit = require('express-rate-limit');
const { authMiddleware } = require('../../middleware/auth');

const kycConfig = require('../../config/kyc-config');
const { createSmsClient } = require('../../lib/sms-client');
const PhoneOtp = require('../../model/phone-otp');
const User = require('../../model/user');
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
const phoneOtpService = createPhoneOtpService({ smsClient, otpRepo, kycConfig, userModel: User });
const { requestOtp, verifyOtp } = createPhoneOtpController({ phoneOtpService });

const otpRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many OTP requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

const verifyRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many OTP verification attempts from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * POST /v1/kyc/otp/request
 * Issues a 6-digit OTP to the phone number.
 */
router.post('/otp/request', authMiddleware, otpRateLimiter, requestOtp);

/**
 * POST /v1/kyc/otp/verify
 * Verifies the OTP and updates the User's phoneVerified status.
 */
router.post('/otp/verify', authMiddleware, verifyRateLimiter, verifyOtp);

module.exports = router;

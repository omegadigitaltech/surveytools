'use strict';

const express = require('express');
const rateLimit = require('express-rate-limit');
const { authMiddleware } = require('../../middleware/auth');

const kycConfig = require('../../config/kyc-config');
const { createEmailClient } = require('../../lib/email-client');
const EmailOtp = require('../../model/email-otp');
const { createEmailOtpRepo } = require('./email-otp.repo');
const { createEmailOtpService } = require('./email-otp.service');
const { createEmailOtpController } = require('./email-otp.controller');

const router = express.Router();

// Wire up the dependency graph
// Support both standard SMTP_ vars and the team's EMAIL_ vars (like Gmail)
const emailClient = createEmailClient({
  host: process.env.SMTP_HOST || (process.env.EMAIL ? 'smtp.gmail.com' : 'smtp.mailtrap.io'),
  port: parseInt(process.env.SMTP_PORT, 10) || (process.env.EMAIL ? 465 : 2525),
  user: process.env.SMTP_USER || process.env.EMAIL_USER || process.env.EMAIL || 'test-user',
  pass: process.env.SMTP_PASS || process.env.EMAIL_PASSWORD || 'test-pass',
  from: process.env.SMTP_FROM || process.env.EMAIL || 'no-reply@omega.edu.ng',
});

const otpRepo = createEmailOtpRepo({ EmailOtp });
const emailOtpService = createEmailOtpService({ emailClient, otpRepo, kycConfig });
const { requestOtp, verifyOtp } = createEmailOtpController({ emailOtpService });

const otpRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
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
 * POST /v1/kyc/email-otp/request
 * Issues a 6-digit OTP to the .edu.ng email.
 */
router.post('/email-otp/request', authMiddleware, otpRateLimiter, requestOtp);

/**
 * POST /v1/kyc/email-otp/verify
 * Verifies the OTP and updates the User's emailVerified status.
 */
router.post('/email-otp/verify', authMiddleware, verifyRateLimiter, verifyOtp);

module.exports = router;

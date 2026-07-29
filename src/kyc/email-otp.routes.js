'use strict';

const express = require('express');
const rateLimit = require('express-rate-limit');

const kycConfig = require('../../config/kyc-config');
const { createEmailClient } = require('../../lib/email-client');
const EmailOtp = require('../../model/email-otp');
const { createEmailOtpRepo } = require('./email-otp.repo');
const { createEmailOtpService } = require('./email-otp.service');
const { createEmailOtpController } = require('./email-otp.controller');

const router = express.Router();

// Wire up the dependency graph
const emailClient = createEmailClient({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: parseInt(process.env.SMTP_PORT, 10) || 2525,
  user: process.env.SMTP_USER || 'test-user',
  pass: process.env.SMTP_PASS || 'test-pass',
  from: process.env.SMTP_FROM || 'no-reply@omega.edu.ng',
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
 * Public — no auth required. Issues a 6-digit OTP to the .edu.ng email.
 */
router.post('/email-otp/request', otpRateLimiter, requestOtp);

/**
 * POST /v1/kyc/email-otp/verify
 * Public — no auth required. Verifies the OTP and marks it consumed.
 */
router.post('/email-otp/verify', verifyRateLimiter, verifyOtp);

module.exports = router;

'use strict';

const express = require('express');
const rateLimit = require('express-rate-limit');
const { authMiddleware } = require('../../middleware/auth');

const kycConfig = require('../../config/kyc-config');
const { createEmailClient } = require('../../lib/email-client');
const EmailOtp = require('../../model/email-otp');
const { createEmailOtpRepo } = require('./email-otp.repo');
const { createEmailOtpService } = require('./email-otp.service');
const { createAcademicEmailOtpController } = require('./academic-email-otp.controller');

const router = express.Router();

// Wire up the dependency graph
const emailClient = createEmailClient({
  host: process.env.SMTP_HOST || (process.env.EMAIL ? 'smtp.gmail.com' : 'smtp.mailtrap.io'),
  port: parseInt(process.env.SMTP_PORT, 10) || (process.env.EMAIL ? 465 : 2525),
  user: process.env.SMTP_USER || process.env.EMAIL_USER || process.env.EMAIL || 'test-user',
  pass: process.env.SMTP_PASS || process.env.EMAIL_PASSWORD || 'test-pass',
  from: process.env.SMTP_FROM || process.env.EMAIL || 'no-reply@omega.edu.ng',
});

const otpRepo = createEmailOtpRepo({ EmailOtp });
// Domain restriction applied for academic/student researchers (default: .edu.ng)
const emailOtpService = createEmailOtpService({
  emailClient,
  otpRepo,
  kycConfig,
  allowedDomain: process.env.KYC_STUDENT_EMAIL_DOMAIN || '.edu.ng',
});
const { requestOtp, verifyOtp } = createAcademicEmailOtpController({ emailOtpService });

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
 * POST /v1/kyc/academic-email-otp/request
 * Issues a 6-digit OTP to an academic .edu.ng email for student researcher verification.
 */
router.post('/academic-email-otp/request', authMiddleware, otpRateLimiter, requestOtp);

/**
 * POST /v1/kyc/academic-email-otp/verify
 * Verifies the OTP and marks the user's academic email as verified (academicEmailVerified = true).
 */
router.post('/academic-email-otp/verify', authMiddleware, verifyRateLimiter, verifyOtp);

module.exports = router;

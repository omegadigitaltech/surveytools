'use strict';

const { z } = require('zod');

const requestEmailOtpBody = z.object({
  email: z.string().email({ message: 'Must be a valid email address' }),
});

const verifyEmailOtpBody = z.object({
  email: z.string().email({ message: 'Must be a valid email address' }),
  code: z.string().length(6, { message: 'OTP must be exactly 6 digits' }).regex(/^\d+$/, 'OTP must be digits only'),
});

const requestEmailOtpSchema = z.object({
  body: requestEmailOtpBody,
});

const verifyEmailOtpSchema = z.object({
  body: verifyEmailOtpBody,
});

module.exports = {
  requestEmailOtpBody,
  verifyEmailOtpBody,
  requestEmailOtpSchema,
  verifyEmailOtpSchema,
};

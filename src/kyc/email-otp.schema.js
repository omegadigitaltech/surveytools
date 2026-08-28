'use strict';

const { z } = require('zod');

const requestEmailOtpSchema = z.object({
  body: z.object({
    email: z.string().email().endsWith('.edu.ng', { message: 'Must be a valid .edu.ng student email' }),
  }),
});

const verifyEmailOtpSchema = z.object({
  body: z.object({
    email: z.string().email(),
    code: z.string().length(6).regex(/^\d+$/, 'OTP must be exactly 6 digits'),
  }),
});

module.exports = {
  requestEmailOtpSchema,
  verifyEmailOtpSchema,
};

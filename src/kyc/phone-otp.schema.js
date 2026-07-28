'use strict';

const { z } = require('zod');

/**
 * Schema for POST /v1/kyc/otp/request
 * Accepts international E.164-format phone numbers (e.g. +2348012345678).
 */
const requestOtpBody = z.object({
  phone: z
    .string({ required_error: 'phone is required' })
    .regex(/^\+\d{7,15}$/, 'phone must be a valid E.164 number (e.g. +2348012345678)'),
});

/**
 * Schema for POST /v1/kyc/otp/verify
 */
const verifyOtpBody = z.object({
  phone: z
    .string({ required_error: 'phone is required' })
    .regex(/^\+\d{7,15}$/, 'phone must be a valid E.164 number (e.g. +2348012345678)'),
  code: z
    .string({ required_error: 'code is required' })
    .regex(/^\d{6}$/, 'code must be exactly 6 digits'),
});

module.exports = { requestOtpBody, verifyOtpBody };

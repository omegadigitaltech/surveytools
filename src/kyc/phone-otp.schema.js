'use strict';

const { z } = require('zod');

const requestOtpBody = z.object({
  phone: z
    .string({ required_error: 'phone is required' })
    .regex(/^\+\d{7,15}$/, 'phone must be a valid E.164 number (e.g. +2348012345678)'),
});

const verifyOtpBody = z.object({
  phone: z
    .string({ required_error: 'phone is required' })
    .regex(/^\+\d{7,15}$/, 'phone must be a valid E.164 number (e.g. +2348012345678)'),
  code: z
    .string({ required_error: 'code is required' })
    .regex(/^\d{6}$/, 'code must be exactly 6 digits'),
});

module.exports = { requestOtpBody, verifyOtpBody };

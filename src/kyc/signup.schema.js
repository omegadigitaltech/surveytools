'use strict';

const { z } = require('zod');

const signupBody = z.object({
  firstName:   z.string().min(1, 'firstName is required'),
  lastName:    z.string().min(1, 'lastName is required'),
  email:       z.string().email('must be a valid email'),
  password:    z.string().min(8, 'password must be at least 8 characters'),
  userType:    z.enum(['researcher', 'respondent']),
  dateOfBirth: z.string().datetime(),
});

module.exports = { signupBody };

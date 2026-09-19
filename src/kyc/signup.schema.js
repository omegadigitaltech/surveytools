'use strict';

const { z } = require('zod');

// Shared core fields — required for ALL users
const coreShape = {
  firstName:   z.string().min(1, 'firstName is required'),
  lastName:    z.string().min(1, 'lastName is required'),
  email:       z.string().email('must be a valid email'),
  password:    z.string().min(8, 'password must be at least 8 characters'),
  userType:    z.enum(['researcher', 'respondent']),
  dateOfBirth: z.string().datetime(),
};

// Researcher signup — only core fields. Type-specific profile collected via POST /v1/kyc/researcher/profile
const researcherSignupBody = z.object({
  ...coreShape,
  userType: z.literal('researcher'),
});

// Respondent signup — core + all Layer 1 demographic fields collected at registration
const respondentSignupBody = z.object({
  ...coreShape,
  userType:         z.literal('respondent'),
  gender:           z.enum(['male', 'female', 'non-binary', 'prefer-not-to-say'], { required_error: 'gender is required' }),
  stateOfOrigin:    z.string().min(1, 'stateOfOrigin is required'),
  stateOfResidence: z.string().min(1, 'stateOfResidence is required'),
  lgaOfResidence:   z.string().min(1, 'lgaOfResidence is required'),
  isStudent:        z.boolean({ required_error: 'isStudent is required' }),
  // Conditional student fields — required only when isStudent = true
  academicLevel:    z.string().optional(),
  levelOfStudy:     z.string().optional(),
  institution:      z.string().optional(),
  faculty:          z.string().optional(),
  department:       z.string().optional(),
}).refine(data => {
  if (data.isStudent) {
    return !!(data.academicLevel && data.levelOfStudy && data.institution && data.faculty && data.department);
  }
  return true;
}, { message: 'academicLevel, levelOfStudy, institution, faculty, and department are required when isStudent is true' });

// Discriminated union — routes to the correct schema based on userType
const signupBody = z.discriminatedUnion('userType', [
  researcherSignupBody,
  respondentSignupBody,
]);

module.exports = { signupBody };

'use strict';

const { z } = require('zod');

const layer1Body = z.object({
  dateOfBirth:      z.string().datetime().refine((val) => {
    const age = (new Date() - new Date(val)) / (1000 * 60 * 60 * 24 * 365.25);
    return age >= 16;
  }, { message: 'Must be at least 16 years old' }),
  gender:           z.enum(['male', 'female', 'non-binary', 'prefer-not-to-say']),
  stateOfOrigin:    z.string().min(1),
  stateOfResidence: z.string().min(1),
  lgaOfResidence:   z.string().min(1),
  isStudent:        z.boolean(),
  phoneNumber:      z.string().optional(),
  // conditional student fields handled dynamically or validated at service layer
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
}, { message: 'Student fields are required when isStudent is true' });

module.exports = { layer1Body };

'use strict';

const { z } = require('zod');

const layer1Body = z.object({
  dateOfBirth:      z.string().datetime(),
  gender:           z.enum(['male', 'female', 'non-binary', 'prefer-not-to-say']),
  stateOfResidence: z.string().min(1),
  lgaOfResidence:   z.string().min(1),
  isStudent:        z.boolean(),
});

module.exports = { layer1Body };

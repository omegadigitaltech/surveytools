'use strict';

const { z } = require('zod');

const layer5Body = z.object({
  religion: z.string().optional(),
  ethnicity: z.string().optional(),
  languagesSpoken: z.array(z.string()).optional(),
  maritalStatus: z.string().optional(), // Extended or different from layer 2, or redundant but placed here for encryption
});

module.exports = { layer5Body };

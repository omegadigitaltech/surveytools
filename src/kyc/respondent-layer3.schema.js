'use strict';

const { z } = require('zod');

const layer3Body = z.object({
  chronicHealthConditions: z.array(z.string()).optional(),
  disabilityStatus: z.string().optional(),
  smokingStatus: z.string().optional(),
  alcoholConsumption: z.string().optional(),
  exerciseFrequency: z.string().optional(),
  dietaryPattern: z.string().optional(),
  bloodGroup: z.string().optional(),
  genotype: z.string().optional(),
  
  // Conditional: female-only fields (enforced at service layer based on DB gender)
  menstrualHealthStatus: z.string().nullable().optional(),
  pregnancyStatus: z.string().nullable().optional(),
});

module.exports = { layer3Body };

'use strict';

const { z } = require('zod');

const layer2Body = z.object({
  educationLevel:   z.enum(['no_formal', 'primary', 'secondary', 'diploma', 'undergraduate', 'postgraduate']),
  employmentStatus: z.enum(['employed', 'self_employed', 'unemployed', 'student', 'retired']),
  incomeRange:      z.enum(['below_50k', '50k_150k', '150k_300k', '300k_500k', 'above_500k']),
  maritalStatus:    z.enum(['single', 'married', 'divorced', 'widowed', 'prefer_not_to_say']),
  
  // Non-student conditional Layer 2
  professionalOccupation: z.string().optional(),
  employmentSector: z.string().optional(),
  graduateStatus:   z.string().optional(),
  
  // Student conditional Layer 2
  studentEmail:     z.string().email().optional(),
  matriculationNumber: z.string().optional(),
});

module.exports = { layer2Body };

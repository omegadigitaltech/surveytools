'use strict';

const { z } = require('zod');

const layer4Body = z.object({
  monthlyHouseholdIncome: z.string().optional(),
  housingType: z.string().optional(),
  primaryTransport: z.string().optional(),
  internetAccessQuality: z.string().optional(),
  primaryDevice: z.string().optional(),
  numberOfDependants: z.number().int().min(0).optional(),
});

module.exports = { layer4Body };

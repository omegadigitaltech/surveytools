'use strict';

const { z } = require('zod');

const studentShape = z.object({
  researcherType: z.literal('student'),
  institution:    z.string().min(1, 'institution is required'),
  faculty:        z.string().min(1, 'faculty is required'),
  department:     z.string().min(1, 'department is required'),
  matricNumber:   z.string().min(1, 'matricNumber is required'),
});

const professionalShape = z.object({
  researcherType: z.literal('professional'),
  jobTitle:       z.string().min(1, 'jobTitle is required'),
  organization:   z.string().min(1, 'organization is required'),
  industry:       z.string().min(1, 'industry is required'),
});

const corporateShape = z.object({
  researcherType: z.literal('corporate'),
  companyName:    z.string().min(1, 'companyName is required'),
  rcNumber:       z.string().min(1, 'rcNumber is required'),
  industry:       z.string().min(1, 'industry is required'),
});

const researcherProfileBody = z.discriminatedUnion('researcherType', [
  studentShape,
  professionalShape,
  corporateShape,
]);

module.exports = { researcherProfileBody };

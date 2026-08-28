'use strict';

const { z } = require('zod');

const studentShape = z.object({
  researcherType: z.literal('student'),
  academicStatus: z.string().min(1),
  institution:    z.string().min(1),
  studentEmail:   z.string().email(),
  faculty:        z.string().min(1),
  department:     z.string().min(1),
  level:          z.string().min(1),
  matriculationNumber: z.string().optional(),
  researchTopic:  z.string().optional(),
});

const professionalShape = z.object({
  researcherType: z.literal('professional'),
  title:          z.string().min(1),
  profession:     z.string().min(1),
  areaOfSpecialisation: z.string().min(1),
  employer:       z.string().min(1),
  workEmail:      z.string().email(),
  stateOfPractice: z.string().min(1),
  researchPurpose: z.string().min(1),
  licenseNo:      z.string().optional(),
});

const corporateShape = z.object({
  researcherType: z.literal('corporate'),
  orgName:        z.string().min(1),
  orgType:        z.string().min(1),
  industry:       z.string().min(1),
  rcNumber:       z.string().optional(), // conditional, handle logic elsewhere
  orgEmail:       z.string().email(),
  orgPhone:       z.string().min(1),
  contactName:    z.string().min(1),
  contactRole:    z.string().min(1),
  stateOfOperation: z.string().min(1),
  billingAddress: z.string().min(1),
  researchPurpose: z.string().min(1),
  expectedMonthlySurveys: z.string().min(1),
});

const researcherProfileBody = z.discriminatedUnion('researcherType', [
  studentShape,
  professionalShape,
  corporateShape,
]);

module.exports = { researcherProfileBody };

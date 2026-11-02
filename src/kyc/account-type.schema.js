'use strict';

const { z } = require('zod');

// Student researcher shape
const studentResearcherShape = z.object({
  userType:            z.literal('researcher'),
  researcherType:      z.literal('student'),
  academicStatus:      z.string().min(1),
  institution:         z.string().min(1),
  studentEmail:        z.string().email(),
  faculty:             z.string().min(1),
  department:          z.string().min(1),
  level:               z.string().min(1),
  matriculationNumber: z.string().optional(),
  researchTopic:       z.string().optional(),
  dateOfBirth:         z.string().datetime().optional(),
});

// Professional researcher shape
const professionalResearcherShape = z.object({
  userType:             z.literal('researcher'),
  researcherType:       z.literal('professional'),
  title:                z.string().min(1),
  profession:           z.string().min(1),
  areaOfSpecialisation: z.string().min(1),
  employer:             z.string().min(1),
  workEmail:            z.string().email(),
  stateOfPractice:      z.string().min(1),
  researchPurpose:      z.string().min(1),
  licenseNo:            z.string().optional(),
  dateOfBirth:          z.string().datetime().optional(),
});

// Corporate researcher shape
const corporateResearcherShape = z.object({
  userType:               z.literal('researcher'),
  researcherType:         z.literal('corporate'),
  orgName:                z.string().min(1),
  orgType:                z.string().min(1),
  industry:               z.string().min(1),
  rcNumber:               z.string().optional(),
  orgEmail:               z.string().email(),
  orgPhone:               z.string().min(1),
  contactName:            z.string().min(1),
  contactRole:            z.string().min(1),
  stateOfOperation:       z.string().min(1),
  billingAddress:         z.string().min(1),
  researchPurpose:        z.string().min(1),
  expectedMonthlySurveys: z.string().min(1),
  dateOfBirth:            z.string().datetime().optional(),
});

// Respondent shape
const respondentShape = z.object({
  userType:         z.literal('respondent'),
  gender:           z.enum(['male', 'female', 'non-binary', 'prefer-not-to-say']),
  stateOfOrigin:    z.string().optional(),
  stateOfResidence: z.string().min(1),
  lgaOfResidence:   z.string().min(1),
  isStudent:        z.boolean(),
  dateOfBirth:      z.string().datetime().optional(),
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
}, { message: 'Student fields (academicLevel, levelOfStudy, institution, faculty, department) are required when isStudent is true' });

// Top-level schema combining researcher variants & respondent
const accountTypeBody = z.union([
  studentResearcherShape,
  professionalResearcherShape,
  corporateResearcherShape,
  respondentShape,
]);

module.exports = {
  accountTypeBody,
  studentResearcherShape,
  professionalResearcherShape,
  corporateResearcherShape,
  respondentShape,
};

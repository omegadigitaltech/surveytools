const { z } = require('zod');

const ALLOWED_FILTERS = [
  'gender', 'stateOfOrigin', 'stateOfResidence', 'lgaOfResidence', 'isStudent',
  'academicLevel', 'levelOfStudy', 'institution', 'faculty', 'department',
  'professionalOccupation', 'employmentSector', 'graduateStatus', 
  'educationLevel', 'employmentStatus', 'incomeRange', 'maritalStatus',
  'bloodGroup', 'religion', 'housingType'
];

const overviewQuerySchema = z.object({});

const analyticsQuerySchema = z.object({
  surveyId: z.string().min(1, "surveyId is required"),
  filters: z.array(z.enum(ALLOWED_FILTERS)).optional(),
});

const exportQuerySchema = z.object({
  surveyId: z.string().min(1, "surveyId is required"),
  format: z.enum(['csv', 'pdf', 'xlsx', 'json', 'pptx', 'spss']).default('csv'),
});

module.exports = {
  overviewQuerySchema,
  analyticsQuerySchema,
  exportQuerySchema,
  ALLOWED_FILTERS
};

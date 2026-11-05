'use strict';

const { z } = require('zod');

const getAcademicEmailDomain = () => process.env.KYC_STUDENT_EMAIL_DOMAIN || '.edu.ng';

const requestAcademicEmailOtpBody = z.object({
  email: z.string().email({ message: 'Must be a valid email address' }).refine(
    (val) => val.endsWith(getAcademicEmailDomain()),
    () => ({ message: `Must be a valid ${getAcademicEmailDomain()} academic email` })
  ),
});

const verifyAcademicEmailOtpBody = z.object({
  email: z.string().email({ message: 'Must be a valid email address' }),
  code: z.string().length(6, { message: 'OTP must be exactly 6 digits' }).regex(/^\d+$/, 'OTP must be digits only'),
});

const requestAcademicEmailOtpSchema = z.object({
  body: requestAcademicEmailOtpBody,
});

const verifyAcademicEmailOtpSchema = z.object({
  body: verifyAcademicEmailOtpBody,
});

module.exports = {
  requestAcademicEmailOtpBody,
  verifyAcademicEmailOtpBody,
  requestAcademicEmailOtpSchema,
  verifyAcademicEmailOtpSchema,
};

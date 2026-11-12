'use strict';

const { z } = require('zod');

/**
 * Validates the body of POST /v1/forms/import.
 * The url field is validated as a string here; platform detection (allowlist)
 * happens in the service layer after schema validation passes.
 */
const importFormBody = z.object({
  url: z.string().url('A valid URL is required'),
});

/**
 * Validates the body of POST /v1/forms/csv-upload.
 * The actual file is handled by multer; this validates any JSON body fields.
 */
const csvUploadBody = z.object({
  title: z.string().min(1).max(255).optional(),
});

/**
 * Validates query params for GET /v1/forms (list endpoint).
 */
const listFormsQuery = z.object({
  platform: z.enum(['typeform', 'tally', 'csv_import', 'google_forms']).optional(),
  page:     z.coerce.number().int().positive().default(1),
  limit:    z.coerce.number().int().positive().max(100).default(20),
});

module.exports = { importFormBody, csvUploadBody, listFormsQuery };

'use strict';

const { z } = require('zod');
const { CONSENT_SCOPES } = require('./consent.model');

const consentBody = z.object({
  scopes: z.array(z.enum(CONSENT_SCOPES)),
});

const updateConsentBody = z.object({
  granted: z.boolean(),
});

module.exports = { consentBody, updateConsentBody };

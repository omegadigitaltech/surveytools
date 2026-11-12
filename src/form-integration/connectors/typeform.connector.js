'use strict';

const crypto = require('crypto');

const axios = require('axios');
const { AppError } = require('../../../lib/app-error');
const { createLogger } = require('../../../lib/logger');

const log = createLogger('typeform-connector');

const TYPEFORM_API_BASE = 'https://api.typeform.com';

/**
 * Extracts the Typeform form ID from a Typeform URL.
 * Handles both to.typeform.com/to/<id> and <account>.typeform.com/to/<id> formats.
 *
 * @param {string} url
 * @returns {string} The form ID
 * @throws {AppError} 400 if the ID cannot be extracted
 */
function extractFormId(url) {
  const match = url.match(/typeform\.com\/to\/([a-zA-Z0-9_-]+)/);
  if (!match) {
    throw new AppError(400, 'Could not extract Typeform form ID from URL. Expected format: https://<account>.typeform.com/to/<formId>');
  }
  return match[1];
}

/**
 * Normalizes a Typeform field type to the common connector type vocabulary.
 * @param {string} typeformType
 * @returns {string}
 */
function normalizeType(typeformType) {
  const map = {
    short_text:      'short_text',
    long_text:       'long_text',
    multiple_choice: 'multiple_choice',
    date:            'date',
    number:          'number',
    email:           'email',
    dropdown:        'multiple_choice',
    yes_no:          'multiple_choice',
    rating:          'number',
    opinion_scale:   'number',
    picture_choice:  'multiple_choice',
    file_upload:     'other',
    payment:         'other',
    statement:       'other',
    group:           'other',
    ranking:         'other',
    matrix:          'other',
    nps:             'number',
    calendly:        'other',
    legal:           'other',
    website:         'short_text',
  };
  return map[typeformType] || 'other';
}

/**
 * Fetches form metadata (title and description) from the Typeform API.
 *
 * @param {string} platformFormId - The Typeform form ID
 * @param {string} apiKey - Typeform personal access token
 * @returns {Promise<{ title: string, description: string }>}
 */
async function fetchMetadata(platformFormId, apiKey) {
  const { data } = await axios.get(`${TYPEFORM_API_BASE}/forms/${platformFormId}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  log.info({ platformFormId }, 'typeform metadata fetched');
  return {
    title:       data.title || '',
    description: data.settings?.description || '',
  };
}

/**
 * Fetches and normalizes the list of questions from a Typeform form.
 *
 * @param {string} platformFormId
 * @param {string} apiKey
 * @returns {Promise<Array<{ ref: string, label: string, type: string, required: boolean, options: string[] }>>}
 */
async function fetchQuestions(platformFormId, apiKey) {
  const { data } = await axios.get(`${TYPEFORM_API_BASE}/forms/${platformFormId}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  const fields = data.fields || [];
  return fields.map(field => ({
    ref:      field.ref || field.id,
    label:    field.title || '',
    type:     normalizeType(field.type),
    required: field.validations?.required || false,
    options:  (field.properties?.choices || []).map(c => c.label || ''),
  }));
}

/**
 * Fetches the current total response count for a Typeform form.
 *
 * @param {string} platformFormId
 * @param {string} apiKey
 * @returns {Promise<number>}
 */
async function fetchResponseCount(platformFormId, apiKey) {
  const { data } = await axios.get(
    `${TYPEFORM_API_BASE}/forms/${platformFormId}/responses`,
    {
      headers: { Authorization: `Bearer ${apiKey}` },
      params:  { page_size: 1 },
    }
  );
  return data.total_items || 0;
}

/**
 * Registers a webhook on a Typeform form so that Typeform calls our server
 * whenever a new response is submitted.
 *
 * @param {string} platformFormId
 * @param {string} apiKey
 * @param {string} webhookUrl - The full public URL Typeform should POST to
 * @param {string} secret - HMAC signing secret to set on the webhook
 * @returns {Promise<void>}
 */
async function registerWebhook(platformFormId, apiKey, webhookUrl, secret) {
  const tag = `surveytools-${platformFormId}`;
  await axios.put(
    `${TYPEFORM_API_BASE}/forms/${platformFormId}/webhooks/${tag}`,
    {
      url:     webhookUrl,
      enabled: true,
      secret,
    },
    { headers: { Authorization: `Bearer ${apiKey}` } }
  );
  log.info({ platformFormId, tag }, 'typeform webhook registered');
}

/**
 * Verifies and parses an inbound Typeform webhook payload.
 * Rejects with AppError(401) if the signature does not match.
 *
 * @param {Buffer} rawBody - The raw request body Buffer (must be raw, not parsed JSON)
 * @param {string} signature - Value of the Typeform-Signature header (base64 HMAC)
 * @param {string} secret - The webhook signing secret
 * @returns {{ platformFormId: string, newResponseCount: number | null }}
 */
function parseWebhookPayload(rawBody, signature, secret) {
  const computed = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('base64');

  const expected = Buffer.from(`sha256=${computed}`);
  const received = Buffer.from(signature || '');

  if (expected.length !== received.length || !crypto.timingSafeEqual(expected, received)) {
    throw new AppError(401, 'Webhook signature verification failed');
  }

  const payload = JSON.parse(rawBody.toString('utf8'));
  const platformFormId = payload.form_response?.form_id || payload.form_id || null;

  if (!platformFormId) {
    throw new AppError(400, 'Webhook payload missing form_id');
  }

  return { platformFormId, newResponseCount: null };
}

module.exports = {
  extractFormId,
  fetchMetadata,
  fetchQuestions,
  fetchResponseCount,
  registerWebhook,
  parseWebhookPayload,
};

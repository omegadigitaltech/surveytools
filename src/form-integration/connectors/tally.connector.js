'use strict';

const crypto = require('crypto');

const axios = require('axios');
const { AppError } = require('../../../lib/app-error');
const { createLogger } = require('../../../lib/logger');

const log = createLogger('tally-connector');

const TALLY_API_BASE = 'https://api.tally.so';

/**
 * Extracts the Tally form ID from a Tally URL.
 * Handles formats: tally.so/r/<id> and tally.so/forms/<id>
 *
 * @param {string} url
 * @returns {string} The form ID
 * @throws {AppError} 400 if the ID cannot be extracted
 */
function extractFormId(url) {
  const match = url.match(/tally\.so\/(?:r|forms)\/([a-zA-Z0-9_-]+)/);
  if (!match) {
    throw new AppError(400, 'Could not extract Tally form ID from URL. Expected format: https://tally.so/r/<formId>');
  }
  return match[1];
}

/**
 * Normalizes a Tally block type to the common connector type vocabulary.
 * @param {string} tallyType
 * @returns {string}
 */
function normalizeType(tallyType) {
  const map = {
    INPUT_TEXT:            'short_text',
    INPUT_EMAIL:           'email',
    INPUT_NUMBER:          'number',
    INPUT_DATE:            'date',
    INPUT_LINK:            'short_text',
    INPUT_PHONE_NUMBER:    'short_text',
    TEXTAREA:              'long_text',
    MULTIPLE_CHOICE:       'multiple_choice',
    CHECKBOXES:            'multiple_choice',
    DROPDOWN:              'multiple_choice',
    RANKING:               'other',
    LINEAR_SCALE:          'number',
    RATING:                'number',
    FILE_UPLOAD:           'other',
    SIGNATURE:             'other',
    PAYMENT:               'other',
    STATEMENT:             'other',
    IMAGE:                 'other',
    EMBED:                 'other',
    HIDDEN_FIELDS:         'other',
  };
  return map[tallyType] || 'other';
}

/**
 * Fetches form metadata (title and description) from the Tally API.
 *
 * @param {string} platformFormId - The Tally form ID
 * @param {string} apiKey - Tally API key
 * @returns {Promise<{ title: string, description: string }>}
 */
async function fetchMetadata(platformFormId, apiKey) {
  const { data } = await axios.get(`${TALLY_API_BASE}/forms/${platformFormId}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  log.info({ platformFormId }, 'tally metadata fetched');
  return {
    title:       data.name || data.title || '',
    description: data.description || '',
  };
}

/**
 * Fetches and normalizes the list of questions from a Tally form.
 *
 * @param {string} platformFormId
 * @param {string} apiKey
 * @returns {Promise<Array<{ ref: string, label: string, type: string, required: boolean, options: string[] }>>}
 */
async function fetchQuestions(platformFormId, apiKey) {
  const { data } = await axios.get(`${TALLY_API_BASE}/forms/${platformFormId}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  const blocks = data.blocks || [];
  const questions = [];
  let currentQuestionTitle = '';

  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (b.groupType === 'QUESTION' || b.type === 'TITLE') {
      const titleText = b.payload?.safeHTMLSchema?.[0]?.[0] || b.payload?.title || b.payload?.label || '';
      if (titleText) currentQuestionTitle = titleText;
    } else if (b.type === 'CHECKBOX' || b.type === 'CHECKBOXES' || b.type === 'MULTIPLE_CHOICE' || b.type === 'DROPDOWN') {
      let existing = questions.find(q => q.label === currentQuestionTitle && q.type === 'multiple_choice');
      if (!existing) {
        existing = {
          ref: b.groupUuid || b.uuid || b.id,
          label: currentQuestionTitle || 'Choice Question',
          type: 'multiple_choice',
          required: b.payload?.isRequired || false,
          options: [],
        };
        questions.push(existing);
      }
      if (b.payload?.text) existing.options.push(b.payload.text);
      if (b.payload?.options && Array.isArray(b.payload.options)) {
        b.payload.options.forEach(o => {
          const optText = o.text || o.label || o;
          if (optText && !existing.options.includes(optText)) existing.options.push(optText);
        });
      }
    } else if (
      b.type.startsWith('INPUT_') ||
      b.type === 'TEXTAREA' ||
      b.type === 'LINEAR_SCALE' ||
      b.type === 'RATING' ||
      b.type === 'FILE_UPLOAD'
    ) {
      questions.push({
        ref: b.uuid || b.id,
        label: currentQuestionTitle || b.payload?.placeholder || b.payload?.label || 'Question',
        type: normalizeType(b.type),
        required: b.payload?.isRequired || false,
        options: (b.payload?.options || []).map(o => o.text || o.label || o),
      });
    }
  }

  // Fallback if no questions matched the grouping heuristic (e.g. flat blocks)
  if (questions.length === 0 && blocks.length > 0) {
    return blocks
      .filter(b => b.type !== 'STATEMENT' && b.type !== 'IMAGE' && b.type !== 'EMBED' && b.type !== 'TITLE')
      .map(block => ({
        ref:      block.uuid || block.id,
        label:    block.payload?.label || block.payload?.question || block.payload?.title || '',
        type:     normalizeType(block.type),
        required: block.payload?.isRequired || block.payload?.required || false,
        options:  (block.payload?.options || []).map(o => o.text || o.label || ''),
      }));
  }

  return questions;
}

/**
 * Fetches the current total response count for a Tally form.
 *
 * @param {string} platformFormId
 * @param {string} apiKey
 * @returns {Promise<number>}
 */
async function fetchResponseCount(platformFormId, apiKey) {
  const { data } = await axios.get(`${TALLY_API_BASE}/forms/${platformFormId}/submissions`, {
    headers: { Authorization: `Bearer ${apiKey}` },
    params:  { limit: 1 },
  });
  return data.totalNumberOfSubmissions || 0;
}

/**
 * Registers a webhook on a Tally form.
 *
 * @param {string} platformFormId
 * @param {string} apiKey
 * @param {string} webhookUrl - The full public URL Tally should POST to
 * @param {string} secret - HMAC signing secret
 * @returns {Promise<void>}
 */
async function registerWebhook(platformFormId, apiKey, webhookUrl, secret) {
  await axios.post(
    `${TALLY_API_BASE}/webhooks`,
    {
      formId: platformFormId,
      url:    webhookUrl,
      secret,
    },
    { headers: { Authorization: `Bearer ${apiKey}` } }
  );
  log.info({ platformFormId }, 'tally webhook registered');
}

/**
 * Verifies and parses an inbound Tally webhook payload.
 * Rejects with AppError(401) if the signature does not match.
 *
 * @param {Buffer} rawBody
 * @param {string} signature - Value of the Tally-Signature header
 * @param {string} secret
 * @returns {{ platformFormId: string, newResponseCount: number | null }}
 */
function parseWebhookPayload(rawBody, signature, secret) {
  const computed = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  const expected = Buffer.from(computed);
  const received = Buffer.from(signature || '');

  if (expected.length !== received.length || !crypto.timingSafeEqual(expected, received)) {
    throw new AppError(401, 'Webhook signature verification failed');
  }

  const payload = JSON.parse(rawBody.toString('utf8'));
  const platformFormId = payload.data?.formId || payload.formId || null;

  if (!platformFormId) {
    throw new AppError(400, 'Webhook payload missing formId');
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

'use strict';

const { google } = require('googleapis');
const { AppError } = require('../../../lib/app-error');
const { createLogger } = require('../../../lib/logger');
const config = require('../../../config/form-integration-config');

const log = createLogger('google-forms-connector');

const SCOPES = [
  'https://www.googleapis.com/auth/forms.responses.readonly',
  'https://www.googleapis.com/auth/forms.body.readonly',
];

/**
 * Returns a configured Google OAuth2 client pre-loaded with stored credentials.
 *
 * @param {{ accessToken: string, refreshToken: string }} credentials
 * @returns {import('googleapis').Auth.OAuth2Client}
 */
function buildOAuth2Client(credentials) {
  const client = new google.auth.OAuth2(
    config.googleClientId,
    config.googleClientSecret,
    config.googleRedirectUri
  );
  client.setCredentials({
    access_token:  credentials.accessToken,
    refresh_token: credentials.refreshToken,
  });
  return client;
}

/**
 * Generates the Google OAuth2 authorization URL that the researcher visits
 * to grant SurveyTools access to their Google Forms data.
 *
 * @returns {string} The consent URL
 */
function getAuthUrl() {
  const client = new google.auth.OAuth2(
    config.googleClientId,
    config.googleClientSecret,
    config.googleRedirectUri
  );
  return client.generateAuthUrl({
    access_type: 'offline',
    prompt:      'consent',
    scope:       SCOPES,
  });
}

/**
 * Exchanges an OAuth authorization code for access and refresh tokens.
 *
 * @param {string} code - The code from Google's redirect callback
 * @returns {Promise<{ accessToken: string, refreshToken: string, expiresAt: Date, scopes: string[] }>}
 */
async function exchangeCode(code) {
  const client = new google.auth.OAuth2(
    config.googleClientId,
    config.googleClientSecret,
    config.googleRedirectUri
  );
  const { tokens } = await client.getToken(code);

  if (!tokens.refresh_token) {
    throw new AppError(400, 'Google did not return a refresh token. Ask the researcher to revoke and re-authorize the app.');
  }

  return {
    accessToken:  tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt:    new Date(tokens.expiry_date),
    scopes:       SCOPES,
  };
}

function handleGoogleApiError(err) {
  const status = err.status || err.code || 500;
  if (status === 404) {
    throw new AppError(404, 'Google Form not found. Please verify the URL and ensure the form belongs to the connected Google account.');
  }
  if (status === 403) {
    throw new AppError(403, `Google Forms access denied: ${err.message}. Please ensure the Google Forms API is enabled in your Google Cloud Console.`);
  }
  throw new AppError(status >= 400 && status < 500 ? status : 500, err.message || 'Google Forms API request failed');
}

/**
 * Extracts the Google Forms form ID from a Google Forms URL.
 *
 * @param {string} url - e.g. https://docs.google.com/forms/d/<formId>/edit
 * @returns {string}
 * @throws {AppError} 400 if the ID cannot be extracted
 */
function extractFormId(url) {
  if (url.includes('forms.gle/')) {
    throw new AppError(
      400,
      'forms.gle is a shortened public respondent link. Google Forms API requires the editor URL. Please open your form in Google Forms and copy the URL from your browser address bar: https://docs.google.com/forms/d/<formId>/edit'
    );
  }
  if (url.includes('/forms/d/e/')) {
    throw new AppError(
      400,
      'You entered a public respondent link (/forms/d/e/...). Google Forms API requires the editor URL. Please open your form in Google Forms and copy the URL from your browser address bar: https://docs.google.com/forms/d/<formId>/edit'
    );
  }
  const match = url.match(/\/forms\/d\/([a-zA-Z0-9_-]+)/);
  if (!match) {
    throw new AppError(400, 'Could not extract Google Forms form ID from URL. Expected format: https://docs.google.com/forms/d/<formId>/edit');
  }
  return match[1];
}

/**
 * Normalizes a Google Forms question type to the common connector vocabulary.
 * @param {string} googleType
 * @returns {string}
 */
function normalizeType(googleType) {
  const map = {
    SHORT_ANSWER:    'short_text',
    PARAGRAPH:       'long_text',
    MULTIPLE_CHOICE: 'multiple_choice',
    CHECKBOXES:      'multiple_choice',
    DROPDOWN:        'multiple_choice',
    DATE:            'date',
    TIME:            'other',
    SCALE:           'number',
    GRID:            'other',
    CHECKBOX_GRID:   'other',
    FILE_UPLOAD:     'other',
    RATING:          'number',
  };
  return map[googleType] || 'other';
}

/**
 * Fetches form metadata from the Google Forms API.
 *
 * @param {string} platformFormId
 * @param {object} credentials - { accessToken, refreshToken }
 * @returns {Promise<{ title: string, description: string }>}
 */
async function fetchMetadata(platformFormId, credentials) {
  try {
    const auth = buildOAuth2Client(credentials);
    const forms = google.forms({ version: 'v1', auth });
    const { data } = await forms.forms.get({ formId: platformFormId });
    log.info({ platformFormId }, 'google forms metadata fetched');
    return {
      title:       data.info?.title || '',
      description: data.info?.description || '',
    };
  } catch (err) {
    handleGoogleApiError(err);
  }
}

/**
 * Fetches and normalizes the list of questions from a Google Form.
 *
 * @param {string} platformFormId
 * @param {object} credentials
 * @returns {Promise<Array<{ ref: string, label: string, type: string, required: boolean, options: string[] }>>}
 */
async function fetchQuestions(platformFormId, credentials) {
  try {
    const auth = buildOAuth2Client(credentials);
    const forms = google.forms({ version: 'v1', auth });
    const { data } = await forms.forms.get({ formId: platformFormId });

    const items = data.items || [];
    return items
      .filter(item => item.questionItem)
      .map(item => {
        const q = item.questionItem.question;
        const choiceQuestion = q.choiceQuestion;
        return {
          ref:      item.itemId,
          label:    item.title || '',
          type:     normalizeType(q.questionType),
          required: q.required || false,
          options:  choiceQuestion
            ? (choiceQuestion.options || []).map(o => o.value || '')
            : [],
        };
      });
  } catch (err) {
    handleGoogleApiError(err);
  }
}

/**
 * Fetches the current total response count for a Google Form.
 *
 * @param {string} platformFormId
 * @param {object} credentials
 * @returns {Promise<number>}
 */
async function fetchResponseCount(platformFormId, credentials) {
  try {
    const auth = buildOAuth2Client(credentials);
    const forms = google.forms({ version: 'v1', auth });
    const { data } = await forms.forms.responses.list({
      formId:   platformFormId,
      pageSize: 1,
    });
    return data.totalSize || 0;
  } catch (err) {
    // If responses list fails (e.g. no responses yet or 404), return 0 gracefully
    log.warn({ platformFormId, err: err.message }, 'could not fetch responses list, defaulting to 0');
    return 0;
  }
}

/**
 * Polls for the latest response count (used by the Bull background job).
 * Returns the updated count.
 *
 * @param {string} platformFormId
 * @param {object} credentials
 * @returns {Promise<number>}
 */
async function pollForNewResponses(platformFormId, credentials) {
  return fetchResponseCount(platformFormId, credentials);
}

module.exports = {
  extractFormId,
  getAuthUrl,
  exchangeCode,
  fetchMetadata,
  fetchQuestions,
  fetchResponseCount,
  pollForNewResponses,
  SCOPES,
};

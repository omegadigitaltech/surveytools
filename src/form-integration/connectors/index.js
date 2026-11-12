'use strict';

const { AppError } = require('../../../lib/app-error');

/**
 * Maps each supported platform to the set of hostname suffixes allowed for
 * that platform. This is the single place SSRF protection is enforced.
 * If a URL does not match any entry here, it is rejected immediately.
 *
 * csv_import has no allowed domains because SurveyHeart is upload-only;
 * no outbound request is ever made for that platform.
 */
const ALLOWED_DOMAINS = Object.freeze({
  typeform:     ['typeform.com'],
  tally:        ['tally.so'],
  google_forms: ['docs.google.com', 'forms.gle'],
  csv_import:   [],
});

/**
 * Inspects a URL and returns the detected platform key.
 * Rejects with AppError(400) if the URL does not match any allowed domain.
 *
 * @param {string} url - The form URL pasted by the researcher
 * @returns {string} Platform key: "typeform" | "tally" | "google_forms"
 * @throws {AppError} 400 if the URL is unsupported or malformed
 */
function detectPlatform(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch (_) {
    throw new AppError(400, 'Invalid URL');
  }

  const hostname = parsed.hostname.toLowerCase();

  for (const [platform, domains] of Object.entries(ALLOWED_DOMAINS)) {
    if (platform === 'csv_import') continue;
    if (domains.some(domain => hostname === domain || hostname.endsWith('.' + domain))) {
      return platform;
    }
  }

  throw new AppError(
    400,
    'Unsupported platform. Supported URL domains: typeform.com, tally.so, docs.google.com (Google Forms). For SurveyHeart, use the CSV upload endpoint.'
  );
}

/**
 * Returns the connector module for a given platform.
 * The connector exposes a consistent interface regardless of platform.
 *
 * @param {string} platform - One of the ALLOWED_DOMAINS keys
 * @returns {object} Connector with fetchMetadata, fetchQuestions, etc.
 * @throws {AppError} 500 if the platform has no registered connector
 */
function getConnector(platform) {
  switch (platform) {
    case 'typeform':
      return require('./typeform.connector');
    case 'tally':
      return require('./tally.connector');
    case 'google_forms':
      return require('./google-forms.connector');
    default:
      throw new AppError(500, `No connector registered for platform: ${platform}`);
  }
}

module.exports = { detectPlatform, getConnector, ALLOWED_DOMAINS };

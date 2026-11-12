'use strict';

const { parse } = require('csv-parse/sync');
const { AppError } = require('../../lib/app-error');
const { createLogger } = require('../../lib/logger');
const { detectPlatform, getConnector } = require('./connectors');
const config = require('../../config/form-integration-config');

/**
 * @param {{
 *   repo: object,
 *   OAuthToken: object,
 * }} dependencies
 * @returns {object}
 */
function createFormIntegrationService({ repo, OAuthToken }) {
  const log = createLogger('form-integration-service');

  /**
   * Imports an external form by URL.
   * Detects the platform via the SSRF allowlist, fetches metadata/questions/
   * response count via the platform connector, and stores the result.
   *
   * @param {string} url - The form URL pasted by the researcher
   * @param {string} researcherId - The authenticated researcher's User.id
   * @returns {Promise<object>} The created ExternalForm document
   */
  async function importForm(url, researcherId) {
    const platform = detectPlatform(url);
    const connector = getConnector(platform);

    const platformFormId = connector.extractFormId(url);

    const existing = await repo.findByPlatformFormId(platformFormId, platform);
    if (existing && existing.researcherId === researcherId) {
      throw new AppError(409, 'This form has already been imported');
    }

    let apiKey;
    let credentials;

    if (platform === 'typeform') {
      apiKey = config.typeformApiKey;
      if (!apiKey) throw new AppError(503, 'Typeform integration is not configured on this server');
    } else if (platform === 'tally') {
      apiKey = config.tallyApiKey;
      if (!apiKey) throw new AppError(503, 'Tally integration is not configured on this server');
    } else if (platform === 'google_forms') {
      credentials = await OAuthToken.getGoogleTokens(researcherId);
      if (!credentials) {
        throw new AppError(403, 'Google Forms authorization required. Visit GET /v1/forms/oauth/google/start to connect your Google account.');
      }
    }

    const [metadata, questions, snapshotResponseCount] = await Promise.all([
      platform === 'google_forms'
        ? connector.fetchMetadata(platformFormId, credentials)
        : connector.fetchMetadata(platformFormId, apiKey),
      platform === 'google_forms'
        ? connector.fetchQuestions(platformFormId, credentials)
        : connector.fetchQuestions(platformFormId, apiKey),
      platform === 'google_forms'
        ? connector.fetchResponseCount(platformFormId, credentials)
        : connector.fetchResponseCount(platformFormId, apiKey),
    ]);

    const externalForm = await repo.createExternalForm({
      researcherId,
      platform,
      platformFormId,
      originalUrl:           url,
      title:                 metadata.title,
      description:           metadata.description,
      questions,
      snapshotResponseCount,
      postImportResponseCount: 0,
      status:                'active',
    });

    if (platform === 'typeform' || platform === 'tally') {
      const webhookBase = config.webhookBaseUrl;
      if (webhookBase) {
        const webhookUrl = `${webhookBase}/v1/forms/webhooks/${platform}`;
        const secret = platform === 'typeform'
          ? config.typeformWebhookSecret
          : config.tallyWebhookSecret;
        try {
          await connector.registerWebhook(platformFormId, apiKey, webhookUrl, secret);
        } catch (err) {
          log.warn({ platformFormId, platform, err: err.message }, 'webhook registration failed — form imported but webhook not active');
        }
      } else {
        log.warn({ platform }, 'FORM_INTEGRATION_WEBHOOK_BASE_URL not set — webhook not registered');
      }
    }

    log.info({ platformFormId, platform, researcherId }, 'external form imported');
    return externalForm;
  }

  /**
   * Handles an inbound webhook event from Typeform or Tally.
   * Verifies the HMAC signature and increments the response count.
   *
   * @param {string} platform - "typeform" | "tally"
   * @param {Buffer} rawBody - Raw request body (must not be parsed before this)
   * @param {string} signature - HMAC signature from the request header
   * @returns {Promise<void>}
   */
  async function handleWebhook(platform, rawBody, signature) {
    const connector = getConnector(platform);
    const secret = platform === 'typeform'
      ? config.typeformWebhookSecret
      : config.tallyWebhookSecret;

    const { platformFormId } = connector.parseWebhookPayload(rawBody, signature, secret);

    const updated = await repo.incrementResponseCount(platformFormId, platform);
    if (!updated) {
      log.warn({ platformFormId, platform }, 'webhook received for unknown form — ignored');
      return;
    }

    log.info({ platformFormId, platform }, 'response count incremented via webhook');
  }

  /**
   * Parses a SurveyHeart CSV export and stores it as an external form.
   * No live integration — this is a one-time snapshot.
   *
   * @param {Buffer} fileBuffer - The raw CSV file buffer from multer
   * @param {string} originalName - Original file name (for logging)
   * @param {string} researcherId
   * @param {string} [title] - Optional title override; defaults to file name
   * @returns {Promise<object>} The created ExternalForm document
   */
  async function uploadCsvSnapshot(fileBuffer, originalName, researcherId, title) {
    let records;
    try {
      records = parse(fileBuffer, {
        columns:          true,
        skip_empty_lines: true,
        trim:             true,
      });
    } catch (err) {
      throw new AppError(400, 'Invalid CSV file: ' + err.message);
    }

    if (!records || records.length === 0) {
      throw new AppError(400, 'CSV file is empty or has no data rows');
    }

    const headers = Object.keys(records[0]);
    const questions = headers.map(header => ({
      ref:      header,
      label:    header,
      type:     'short_text',
      required: false,
      options:  [],
    }));

    const platformFormId = `csv_${researcherId}_${Date.now()}`;

    const externalForm = await repo.createExternalForm({
      researcherId,
      platform:              'csv_import',
      platformFormId,
      originalUrl:           originalName,
      title:                 title || originalName,
      description:           '',
      questions,
      snapshotResponseCount: records.length,
      postImportResponseCount: 0,
      status:                'active',
    });

    log.info({ platformFormId, researcherId, rowCount: records.length }, 'csv snapshot uploaded');
    return externalForm;
  }

  /**
   * Lists imported forms for a researcher.
   *
   * @param {string} researcherId
   * @param {{ platform?: string, page: number, limit: number }} opts
   * @returns {Promise<{ data: object[], total: number, page: number, totalPages: number }>}
   */
  async function listForms(researcherId, opts) {
    const { data, total } = await repo.listForResearcher(researcherId, opts);
    return {
      data,
      total,
      page:       opts.page,
      totalPages: Math.ceil(total / opts.limit),
    };
  }

  /**
   * Returns a single imported form by ID, scoped to the researcher.
   *
   * @param {string} id
   * @param {string} researcherId
   * @returns {Promise<object>}
   */
  async function getForm(id, researcherId) {
    const form = await repo.findById(id, researcherId);
    if (!form) throw new AppError(404, 'Form not found');
    return form;
  }

  /**
   * Polls Google Forms for updated response counts.
   * Called by the background Bull job.
   *
   * @param {string} platformFormId
   * @param {string} researcherId
   * @returns {Promise<void>}
   */
  async function pollGoogleForm(platformFormId, researcherId) {
    const credentials = await OAuthToken.getGoogleTokens(researcherId);
    if (!credentials) {
      log.warn({ platformFormId, researcherId }, 'poll skipped — no Google credentials');
      return;
    }
    const connector = getConnector('google_forms');
    const count = await connector.pollForNewResponses(platformFormId, credentials);
    await repo.setResponseCount(platformFormId, 'google_forms', count);
    log.info({ platformFormId, count }, 'google forms poll complete');
  }

  return {
    importForm,
    handleWebhook,
    uploadCsvSnapshot,
    listForms,
    getForm,
    pollGoogleForm,
  };
}

module.exports = { createFormIntegrationService };

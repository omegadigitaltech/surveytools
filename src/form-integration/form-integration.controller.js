'use strict';

/**
 * @param {{ service: object, AppError: function, OAuthToken: object }} dependencies
 * @returns {object}
 */
function createFormIntegrationController({ service, AppError, OAuthToken }) {

  /**
   * POST /v1/forms/import
   * Accepts a validated URL, imports the form, returns the created record.
   *
   * @param {object} req
   * @param {object} res
   * @param {function} next
   */
  async function importForm(req, res, next) {
    try {
      const form = await service.importForm(req.body.url, req.userId);
      res.status(201).json({ status: 'success', data: form });
    } catch (err) { next(err); }
  }

  /**
   * GET /v1/forms
   * Lists the researcher's imported forms with optional filters and pagination.
   *
   * @param {object} req
   * @param {object} res
   * @param {function} next
   */
  async function listForms(req, res, next) {
    try {
      const { platform, page, limit } = req.parsedQuery;
      const result = await service.listForms(req.userId, { platform, page, limit });
      res.json({ status: 'success', data: result });
    } catch (err) { next(err); }
  }

  /**
   * GET /v1/forms/:id
   * Returns a single imported form's full detail.
   *
   * @param {object} req
   * @param {object} res
   * @param {function} next
   */
  async function getForm(req, res, next) {
    try {
      const form = await service.getForm(req.params.id, req.userId);
      res.json({ status: 'success', data: form });
    } catch (err) { next(err); }
  }

  /**
   * POST /v1/forms/csv-upload
   * Accepts a multer-parsed CSV file and stores a snapshot.
   *
   * @param {object} req
   * @param {object} res
   * @param {function} next
   */
  async function uploadCsv(req, res, next) {
    try {
      if (!req.file) throw new AppError(400, 'No CSV file uploaded');
      const form = await service.uploadCsvSnapshot(
        req.file.buffer,
        req.file.originalname,
        req.userId,
        req.body.title
      );
      res.status(201).json({ status: 'success', data: form });
    } catch (err) { next(err); }
  }

  /**
   * GET /v1/forms/oauth/google/start
   * Redirects the researcher to Google's consent screen.
   *
   * @param {object} req
   * @param {object} res
   * @param {function} next
   */
  async function googleOAuthStart(req, res, next) {
    try {
      const { getConnector } = require('./connectors');
      const connector = getConnector('google_forms');
      const url = connector.getAuthUrl();
      res.redirect(url);
    } catch (err) { next(err); }
  }

  /**
   * GET /v1/forms/oauth/google/callback
   * Exchanges the OAuth code for tokens and stores them.
   *
   * @param {object} req
   * @param {object} res
   * @param {function} next
   */
  async function googleOAuthCallback(req, res, next) {
    try {
      const { code } = req.query;
      if (!code) throw new AppError(400, 'Missing authorization code from Google');

      const { getConnector } = require('./connectors');
      const connector = getConnector('google_forms');
      const tokens = await connector.exchangeCode(code);

      await OAuthToken.upsertGoogleTokens(
        req.userId,
        tokens.accessToken,
        tokens.refreshToken,
        tokens.expiresAt,
        tokens.scopes
      );

      res.json({ status: 'success', message: 'Google Forms connected successfully' });
    } catch (err) { next(err); }
  }

  return {
    importForm,
    listForms,
    getForm,
    uploadCsv,
    googleOAuthStart,
    googleOAuthCallback,
  };
}

module.exports = { createFormIntegrationController };

'use strict';
const { AppError } = require('../../lib/app-error');
const { consentBody, updateConsentBody } = require('./consent.schema');
const logger = require('../../lib/logger');
const { CONSENT_SCOPES } = require('./consent.model');

/**
 * @param {{ service: object }} dependencies
 * @returns {object}
 */
function createConsentController({ service }) {
  async function captureConsent(req, res, next) {
    try {
      const result = consentBody.safeParse(req.body);
      if (!result.success) throw new AppError(400, result.error.errors[0].message);
      
      await service.captureInitialConsent(req.userId, result.data.scopes);
      logger.info({ action: 'capture_consent', userId: req.userId });
      res.status(200).json({ status: 'success' });
    } catch (err) { next(err); }
  }

  async function updateConsent(req, res, next) {
    try {
      const { scope } = req.params;
      if (!CONSENT_SCOPES.includes(scope)) {
        throw new AppError(400, 'Invalid scope');
      }
      const result = updateConsentBody.safeParse(req.body);
      if (!result.success) throw new AppError(400, result.error.errors[0].message);

      await service.updateConsentScope(req.userId, scope, result.data.granted);
      logger.info({ action: 'update_consent', userId: req.userId, scope, granted: result.data.granted });
      res.status(200).json({ status: 'success' });
    } catch (err) { next(err); }
  }

  return { captureConsent, updateConsent };
}
module.exports = { createConsentController };

'use strict';
const { AppError } = require('../../lib/app-error');
const ConsentRecord = require('./consent.model');
const { createConsentRepo } = require('./consent.repo');
const consentRepo = createConsentRepo({ ConsentRecord });

function requireConsent(scope) {
  return async (req, res, next) => {
    try {
      const record = await consentRepo.getConsent(req.userId, scope);
      if (!record || !record.granted) {
        throw new AppError(403, `Consent required for scope: ${scope}`);
      }
      next();
    } catch (err) { next(err); }
  };
}
module.exports = { requireConsent };

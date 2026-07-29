'use strict';

/**
 * @param {{ consentRepo: object }} dependencies
 */
function createConsentService({ consentRepo }) {
  return {
    async captureInitialConsent(userId, scopes) {
      const data = { granted: true, grantedAt: new Date(), revokedAt: null };
      const promises = scopes.map(scope => consentRepo.upsertConsent(userId, scope, data));
      await Promise.all(promises);
      return { success: true };
    },
    
    async updateConsentScope(userId, scope, granted) {
      const data = {
        granted,
        ...(granted ? { grantedAt: new Date(), revokedAt: null } : { revokedAt: new Date(), granted: false })
      };
      return consentRepo.upsertConsent(userId, scope, data);
    }
  };
}

module.exports = { createConsentService };

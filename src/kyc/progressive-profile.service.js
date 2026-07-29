'use strict';

const kycConfig = require('../../config/kyc-config');

/**
 * @param {{ respondentProfileRepo: object }} dependencies
 * @returns {{ onSurveyCompleted: (userId: string) => Promise<void> }}
 */
function createProgressiveProfileService({ respondentProfileRepo }) {
  return {
    async onSurveyCompleted(userId) {
      const profile = await respondentProfileRepo.findByUserId(userId);
      if (!profile) return;

      const updated = await respondentProfileRepo.incrementSurveysCompleted(userId);
      const threshold = kycConfig.kycLayer2SurveyThreshold || 5;
      
      if (updated.surveysCompleted >= threshold && !updated.layer2EligibleAt) {
        await respondentProfileRepo.setLayer2Eligible(userId, new Date());
      }
    },
  };
}

module.exports = { createProgressiveProfileService };

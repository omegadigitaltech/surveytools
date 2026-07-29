'use strict';

const { AppError } = require('../../lib/app-error');

/**
 * @param {{ respondentProfileRepo: object }} dependencies
 * @returns {{ submitLayer2: (userId: string, data: object) => Promise<object>, getLayerStatus: (userId: string) => Promise<object> }}
 */
function createRespondentLayer2Service({ respondentProfileRepo }) {
  return {
    async submitLayer2(userId, data) {
      const profile = await respondentProfileRepo.findByUserId(userId);
      if (!profile) {
        throw new AppError(403, 'Layer 1 profile required before Layer 2');
      }
      if (!profile.layer2EligibleAt) {
        throw new AppError(403, 'Not yet eligible for Layer 2 profiling');
      }
      if (profile.layer2Completed) {
        throw new AppError(409, 'Layer 2 profiling already completed');
      }

      return respondentProfileRepo.updateLayer2(userId, data);
    },

    async getLayerStatus(userId) {
      const profile = await respondentProfileRepo.findByUserId(userId);
      if (!profile) {
        return { layer1Completed: false, layer2Eligible: false, layer2Completed: false };
      }
      return {
        layer1Completed: true,
        layer2Eligible: !!profile.layer2EligibleAt,
        layer2Completed: profile.layer2Completed,
      };
    }
  };
}

module.exports = { createRespondentLayer2Service };

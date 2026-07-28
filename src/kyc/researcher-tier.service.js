'use strict';

const { AppError } = require('../../lib/app-error');

const ResearcherTier = Object.freeze({
  STANDARD:      'Standard',
  PREMIUM:       'Premium',
  INSTITUTIONAL: 'Institutional',
});

const TIER_MAP = {
  student:      ResearcherTier.STANDARD,
  professional: ResearcherTier.PREMIUM,
  corporate:    ResearcherTier.INSTITUTIONAL,
};

/**
 * @param {{ researcherProfileRepo: object }} dependencies
 * @returns {{ resolveTier: (userId: string) => Promise<string> }}
 */
function createResearcherTierService({ researcherProfileRepo }) {
  return {
    async resolveTier(userId) {
      const profile = await researcherProfileRepo.findByUserId(userId);
      if (!profile) throw new AppError(404, 'Researcher profile not found');
      const tier = TIER_MAP[profile.researcherType];
      await researcherProfileRepo.updateTier(userId, tier);
      return tier;
    },
  };
}

module.exports = { createResearcherTierService, ResearcherTier };

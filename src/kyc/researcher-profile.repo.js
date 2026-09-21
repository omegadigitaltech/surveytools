'use strict';

/**
 * @param {{ ResearcherProfile: import('mongoose').Model }} deps
 * @returns {{
 *   findByUserId: (userId: string) => Promise<object|null>,
 *   create: (data: object) => Promise<object>,
 *   updateTier: (userId: string, tier: string) => Promise<object|null>
 * }}
 */
function createResearcherProfileRepo({ ResearcherProfile }) {
  async function findByUserId(userId) {
    return ResearcherProfile.findOne({ userId }).lean();
  }

  async function create(data) {
    const profile = await ResearcherProfile.create(data);
    return profile.toObject();
  }

  async function updateTier(userId, tier) {
    const profile = await ResearcherProfile.findOneAndUpdate(
      { userId },
      { tier },
      { new: true }
    );
    return profile ? profile.toObject() : null;
  }

  return { findByUserId, create, updateTier };
}

module.exports = { createResearcherProfileRepo };

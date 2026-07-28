'use strict';

/**
 * @param {{ ResearcherProfile: import('mongoose').Model }} deps
 * @returns {{
 *   findByUserId: (userId: string) => Promise<object|null>,
 *   create: (data: object) => Promise<object>
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

  return { findByUserId, create };
}

module.exports = { createResearcherProfileRepo };

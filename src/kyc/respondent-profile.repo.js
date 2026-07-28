'use strict';

/**
 * @param {{ RespondentProfile: import('mongoose').Model }} dependencies
 * @returns {{ findByUserId: (userId: string) => Promise<object|null>, create: (data: object) => Promise<object> }}
 */
function createRespondentProfileRepo({ RespondentProfile }) {
  async function findByUserId(userId) {
    return RespondentProfile.findOne({ userId }).lean();
  }

  async function create(data) {
    const profile = await RespondentProfile.create(data);
    return profile.toObject();
  }

  return { findByUserId, create };
}

module.exports = { createRespondentProfileRepo };

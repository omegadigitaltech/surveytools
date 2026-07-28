'use strict';

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

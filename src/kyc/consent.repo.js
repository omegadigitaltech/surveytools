'use strict';

/**
 * @param {{ ConsentRecord: import('mongoose').Model }} dependencies
 * @returns {object}
 */
function createConsentRepo({ ConsentRecord }) {
  async function upsertConsent(userId, scope, data) {
    return ConsentRecord.findOneAndUpdate(
      { userId, scope },
      { $set: data },
      { upsert: true, new: true }
    ).lean();
  }

  async function getConsent(userId, scope) {
    return ConsentRecord.findOne({ userId, scope }).lean();
  }

  return { upsertConsent, getConsent };
}

module.exports = { createConsentRepo };

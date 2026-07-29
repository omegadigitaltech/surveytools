'use strict';

/**
 * @param {{ RespondentProfile: import('mongoose').Model }} dependencies
 * @returns {object}
 */
function createRespondentProfileRepo({ RespondentProfile }) {
  async function findByUserId(userId) {
    return RespondentProfile.findOne({ userId }).lean();
  }

  async function create(data) {
    const profile = await RespondentProfile.create(data);
    return profile.toObject();
  }

  async function incrementSurveysCompleted(userId) {
    return RespondentProfile.findOneAndUpdate(
      { userId },
      { $inc: { surveysCompleted: 1 } },
      { new: true }
    ).lean();
  }

  async function setLayer2Eligible(userId, date) {
    return RespondentProfile.findOneAndUpdate(
      { userId },
      { layer2EligibleAt: date },
      { new: true }
    ).lean();
  }

  async function updateLayer2(userId, data) {
    return RespondentProfile.findOneAndUpdate(
      { userId },
      { ...data, layer2Completed: true },
      { new: true }
    ).lean();
  }

  async function updateLayer3(userId, encryptedData) {
    return RespondentProfile.findOneAndUpdate(
      { userId },
      { layer3: encryptedData, layer3Completed: true },
      { new: true }
    ).lean();
  }

  async function updateLayer4(userId, encryptedData) {
    return RespondentProfile.findOneAndUpdate(
      { userId },
      { layer4: encryptedData, layer4Completed: true },
      { new: true }
    ).lean();
  }

  async function updateLayer5(userId, encryptedData) {
    return RespondentProfile.findOneAndUpdate(
      { userId },
      { layer5: encryptedData, layer5Completed: true },
      { new: true }
    ).lean();
  }

  return {
    findByUserId,
    create,
    incrementSurveysCompleted,
    setLayer2Eligible,
    updateLayer2,
    updateLayer3,
    updateLayer4,
    updateLayer5
  };
}

module.exports = { createRespondentProfileRepo };

'use strict';

const { AppError } = require('../../lib/app-error');
const { encrypt } = require('../../lib/field-encryptor');

/**
 * @param {{ respondentProfileRepo: object }} dependencies
 * @returns {object}
 */
function createRespondentSensitiveLayersService({ respondentProfileRepo }) {
  async function checkPrerequisites(userId, currentLayer) {
    const profile = await respondentProfileRepo.findByUserId(userId);
    if (!profile) throw new AppError(404, 'Profile not found');
    
    if (!profile.layer2Completed) {
      throw new AppError(403, 'Layer 2 must be completed first');
    }

    if (currentLayer === 3 && profile.layer3Completed || profile.layer3) {
      throw new AppError(409, 'Layer 3 already completed');
    }
    if (currentLayer === 4 && profile.layer4Completed || profile.layer4) {
      throw new AppError(409, 'Layer 4 already completed');
    }
    if (currentLayer === 5 && profile.layer5Completed || profile.layer5) {
      throw new AppError(409, 'Layer 5 already completed');
    }
  }

  async function submitLayer3(userId, payload) {
    await checkPrerequisites(userId, 3);
    const encrypted = encrypt(JSON.stringify(payload));
    await respondentProfileRepo.updateLayer3(userId, encrypted);
  }

  async function submitLayer4(userId, payload) {
    await checkPrerequisites(userId, 4);
    const encrypted = encrypt(JSON.stringify(payload));
    await respondentProfileRepo.updateLayer4(userId, encrypted);
  }

  async function submitLayer5(userId, payload) {
    await checkPrerequisites(userId, 5);
    const encrypted = encrypt(JSON.stringify(payload));
    await respondentProfileRepo.updateLayer5(userId, encrypted);
  }

  return { submitLayer3, submitLayer4, submitLayer5 };
}

module.exports = { createRespondentSensitiveLayersService };

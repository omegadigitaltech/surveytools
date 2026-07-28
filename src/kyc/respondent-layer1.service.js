'use strict';

const { AppError } = require('../../lib/app-error');
const { assertMinAge } = require('../../lib/age-gate');
const User = require('../../model/user');

/**
 * @param {{ respondentProfileRepo: object }} dependencies
 * @returns {{ submit: (userId: string, data: object) => Promise<object> }}
 */
function createRespondentLayer1Service({ respondentProfileRepo }) {
  return {
    async submit(userId, data) {
      const user = await User.findById(userId).select('phoneVerified');
      if (!user) {
         throw new AppError(404, 'User not found');
      }
      if (!user.phoneVerified) {
        throw new AppError(400, 'Phone not verified — complete OTP flow first');
      }
      assertMinAge(data.dateOfBirth);

      const existing = await respondentProfileRepo.findByUserId(userId);
      if (existing) throw new AppError(409, 'Layer 1 profile already submitted');

      return respondentProfileRepo.create({ userId, ...data });
    },
  };
}

module.exports = { createRespondentLayer1Service };

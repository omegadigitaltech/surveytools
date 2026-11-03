'use strict';

const { AppError } = require('../../lib/app-error');
const { createLogger } = require('../../lib/logger');

const log = createLogger('account-type-service');

const RESEARCHER_TIER_MAP = Object.freeze({
  student:      'Standard',
  professional: 'Premium',
  corporate:    'Institutional',
});

/**
 * @param {{
 *   User: import('mongoose').Model,
 *   ResearcherProfile: import('mongoose').Model,
 *   RespondentProfile: import('mongoose').Model
 * }} deps
 * @returns {{ updateAccountType: (userId: string, data: object) => Promise<object> }}
 */
function createAccountTypeService({ User, ResearcherProfile, RespondentProfile }) {
  async function updateAccountType(userId, data) {
    const user = await User.findOne({ id: userId });
    if (!user) {
      throw new AppError(404, 'User not found');
    }

    // 1. Update user account type and optional dateOfBirth
    user.userType = data.userType;
    if (data.dateOfBirth) {
      user.dateOfBirth = new Date(data.dateOfBirth);
    }
    await user.save();

    let profileDoc = null;

    // 2. Branch into Researcher or Respondent profile upsert
    if (data.userType === 'researcher') {
      const tier = RESEARCHER_TIER_MAP[data.researcherType] || 'Standard';
      const { userType, dateOfBirth, ...profilePayload } = data;

      profileDoc = await ResearcherProfile.findOneAndUpdate(
        { userId },
        {
          userId,
          tier,
          ...profilePayload,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      log.info({ userId, userType: data.userType, researcherType: data.researcherType, tier }, 'researcher profile updated');
    } else if (data.userType === 'respondent') {
      const { userType, dateOfBirth, ...profilePayload } = data;
      const dob = user.dateOfBirth || (dateOfBirth ? new Date(dateOfBirth) : new Date('2000-01-01'));

      profileDoc = await RespondentProfile.findOneAndUpdate(
        { userId },
        {
          userId,
          phoneNumber: user.phone || '',
          dateOfBirth: dob,
          ...profilePayload,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      log.info({ userId, userType: data.userType }, 'respondent profile updated');
    }

    return {
      userId: user.id,
      userType: user.userType,
      profile: profileDoc ? profileDoc.toObject() : null,
    };
  }

  return { updateAccountType };
}

module.exports = { createAccountTypeService, RESEARCHER_TIER_MAP };

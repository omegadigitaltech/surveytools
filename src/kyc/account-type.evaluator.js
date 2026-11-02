'use strict';

const { Survey } = require('../../model/survey');
const ResearcherProfile = require('./researcher-profile.model');
const RespondentProfile = require('./respondent-profile.model');
const User = require('../../model/user');

/**
 * Dynamically checks if a user needs to select or complete their account type.
 * - If userType is null, checks whether the user has created surveys in the past.
 *   If so, automatically tags userType as 'researcher' in the database (additive only).
 * - Determines requiresAccountTypeUpdate:
 *   - true if userType is null
 *   - true if userType is 'researcher' but no ResearcherProfile has been submitted yet
 *   - true if userType is 'respondent' but no RespondentProfile has been submitted yet
 *   - false if their respective profile is already completed
 *
 * @param {object} user - Mongoose User document
 * @param {object} [userData] - Plain JS object of the user returned in the API response
 * @returns {Promise<{ requiresAccountTypeUpdate: boolean, userType: string|null }>}
 */
async function evaluateUserAccountType(user, userData = null) {
  try {
    let currentType = user.userType;

    // 1. If userType is not set, dynamically check past survey creation
    if (!currentType) {
      const hasSurveys = await Survey.exists({ user_id: user._id });
      if (hasSurveys) {
        currentType = 'researcher';
        user.userType = 'researcher';
        if (userData) {
          userData.userType = 'researcher';
        }
        await User.updateOne({ _id: user._id }, { $set: { userType: 'researcher' } });
      }
    }

    // 2. Check if a profile popup is needed
    let requiresAccountTypeUpdate = false;
    if (!currentType) {
      requiresAccountTypeUpdate = true;
    } else if (currentType === 'researcher') {
      const hasProfile = await ResearcherProfile.exists({ userId: user.id });
      requiresAccountTypeUpdate = !hasProfile;
    } else if (currentType === 'respondent') {
      const hasProfile = await RespondentProfile.exists({ userId: user.id });
      requiresAccountTypeUpdate = !hasProfile;
    }

    return {
      requiresAccountTypeUpdate,
      userType: currentType,
    };
  } catch (_) {
    return {
      requiresAccountTypeUpdate: !user.userType,
      userType: user.userType || null,
    };
  }
}

module.exports = { evaluateUserAccountType };

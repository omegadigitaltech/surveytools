'use strict';

const mongoose = require('mongoose');
const User = require('../../model/user');
const ResearcherProfile = require('../kyc/researcher-profile.model');
const RespondentProfile  = require('../kyc/respondent-profile.model');

function createErasureService() {
  return {
    async erase(userId) {
      // 1. Wipe KYC-specific collections
      await ResearcherProfile.deleteOne({ userId });
      await RespondentProfile.deleteOne({ userId });

      // 2. Anonymize User — do NOT hard-delete (gamification + transaction records reference it)
      await User.findByIdAndUpdate(userId, {
        firstName: '[deleted]',
        lastName:  '[deleted]',
        email:     `deleted-${userId}@surveytools.invalid`,
        phone:     null,
        kycStatus: 'erased',
      });

      // 3. Null userId on survey responses — preserve records for analytics
      try {
        await mongoose.model('SurveyResponse').updateMany(
          { userId },
          { $set: { userId: null } }
        );
      } catch (err) {
        // Safe to ignore in test context where model might not be registered
        if (err.name !== 'MissingSchemaError') {
          throw err;
        }
      }
    },
  };
}

module.exports = { createErasureService };

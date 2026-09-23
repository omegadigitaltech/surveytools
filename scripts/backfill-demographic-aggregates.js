require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../db/connectDB');
const RespondentProfile = require('../src/kyc/respondent-profile.model');
const { decrypt } = require('../lib/field-encryptor');
const { Survey } = require('../model/survey');
const { createDemographicCreditService } = require('../src/corporate-dashboard/demographic-credit.service');
const SurveyLayerCredit = require('../model/survey-layer-credit');
const DemographicAggregate = require('../model/demographic-aggregate');
const { createLogger } = require('../lib/logger');

const logger = createLogger('backfill');

const { creditLayerToSurvey } = createDemographicCreditService({
  SurveyLayerCredit,
  DemographicAggregate,
  createLogger
});

async function backfillPastSurveys(userId, layer, plaintextPayload) {
  const pastSurveys = await Survey.find({ submittedUsers: userId }).select('_id');
  let count = 0;
  for (const s of pastSurveys) {
    try {
      await creditLayerToSurvey(s._id, userId, layer, plaintextPayload);
      count++;
    } catch (err) {
      logger.warn({ err, surveyId: s._id, userId, layer }, 'Failed to credit survey for user layer');
    }
  }
  return count;
}

async function run() {
  await connectDB();
  logger.info('Connected to DB. Starting backfill...');

  const profiles = await RespondentProfile.find({
    $or: [
      { layer3: { $ne: null } },
      { layer4: { $ne: null } },
      { layer5: { $ne: null } },
    ]
  });

  logger.info({ profilesFound: profiles.length }, 'Found profiles with Layer 3-5 data.');

  let successCount = 0;
  let failCount = 0;

  for (const profile of profiles) {
    const userId = profile.userId;
    logger.info({ userId }, 'Processing user');

    for (const layer of ['layer3', 'layer4', 'layer5']) {
      if (profile[layer]) {
        try {
          const plaintext = JSON.parse(decrypt(profile[layer]));
          const credited = await backfillPastSurveys(userId, layer, plaintext);
          logger.info({ layer, creditedSurveys: credited }, 'Layer credited');
          successCount++;
        } catch (err) {
          logger.error({ err, userId, layer }, 'Failed processing layer for user');
          failCount++;
        }
      }
    }
  }

  logger.info({ successCount, failCount }, 'Backfill complete.');
  process.exit(0);
}

run().catch(err => {
  logger.error({ err }, 'Fatal error during backfill');
  process.exit(1);
});

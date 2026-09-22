require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../db/connectDB');
const RespondentProfile = require('../src/kyc/respondent-profile.model');
const { decrypt } = require('../lib/field-encryptor');
const { Survey } = require('../model/survey');
const { creditLayerToSurvey } = require('../src/corporate-dashboard/demographic-credit.service');

async function backfillPastSurveys(userId, layer, plaintextPayload) {
  const pastSurveys = await Survey.find({ submittedUsers: userId }).select('_id');
  let count = 0;
  for (const s of pastSurveys) {
    try {
      await creditLayerToSurvey(s._id, userId, layer, plaintextPayload);
      count++;
    } catch (err) {
      console.warn(`[WARN] Failed to credit survey ${s._id} for user ${userId} layer ${layer}:`, err.message);
    }
  }
  return count;
}

async function run() {
  await connectDB();
  console.log('Connected to DB. Starting backfill...');

  const profiles = await RespondentProfile.find({
    $or: [
      { layer3: { $ne: null } },
      { layer4: { $ne: null } },
      { layer5: { $ne: null } },
    ]
  });

  console.log(`Found ${profiles.length} profiles with Layer 3-5 data.`);

  let successCount = 0;
  let failCount = 0;

  for (const profile of profiles) {
    const userId = profile.userId;
    console.log(`Processing userId: ${userId}`);

    for (const layer of ['layer3', 'layer4', 'layer5']) {
      if (profile[layer]) {
        try {
          const plaintext = JSON.parse(decrypt(profile[layer]));
          const credited = await backfillPastSurveys(userId, layer, plaintext);
          console.log(` - ${layer}: credited to ${credited} surveys`);
          successCount++;
        } catch (err) {
          console.error(`[ERROR] Failed processing ${layer} for user ${userId}:`, err.message);
          failCount++;
        }
      }
    }
  }

  console.log(`Backfill complete. Success: ${successCount}, Failures: ${failCount}`);
  process.exit(0);
}

run().catch(err => {
  console.error('Fatal error during backfill:', err);
  process.exit(1);
});

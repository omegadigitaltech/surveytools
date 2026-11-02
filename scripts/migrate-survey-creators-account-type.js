'use strict';

/**
 * Migration Script: Tag Past Survey Creators as Researchers
 *
 * Safe, additive-only migration.
 * NEVER deletes or modifies existing user data or profiles.
 * Only finds users who have created surveys in the past and sets userType: 'researcher'
 * if their userType is currently null or undefined.
 */

require('dotenv').config();
const mongoose = require('mongoose');

async function migrateSurveyCreators() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI not found in environment');
    process.exit(1);
  }

  console.log('Connecting to MongoDB...');
  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB\n');

  const User = require('../model/user');
  const { Survey } = require('../model/survey');

  // 1. Find all distinct survey creators
  const distinctCreatorIds = await Survey.distinct('user_id');
  console.log(`Found ${distinctCreatorIds.length} distinct survey creator IDs in Survey collection.`);

  if (distinctCreatorIds.length === 0) {
    console.log('No survey creators found. Nothing to migrate.');
    await mongoose.disconnect();
    return;
  }

  // 2. Inspect these creators in User collection
  const surveyCreators = await User.find({ _id: { $in: distinctCreatorIds } })
    .select('_id id fullname email userType');

  console.log(`Found ${surveyCreators.length} corresponding user accounts in User collection:\n`);

  let updatedCount = 0;
  let alreadyResearcherCount = 0;
  let otherTypeCount = 0;

  for (const creator of surveyCreators) {
    if (!creator.userType) {
      console.log(`  Updating User [${creator.email || creator.fullname || creator.id}] (Current userType: null) -> 'researcher'`);
      await User.updateOne(
        { _id: creator._id },
        { $set: { userType: 'researcher' } }
      );
      updatedCount++;
    } else if (creator.userType === 'researcher') {
      console.log(`  User [${creator.email || creator.fullname || creator.id}] already has userType: 'researcher' (Skipped)`);
      alreadyResearcherCount++;
    } else {
      console.log(`  User [${creator.email || creator.fullname || creator.id}] has existing userType: '${creator.userType}' (Skipped to prevent overwrite)`);
      otherTypeCount++;
    }
  }

  console.log('\n──────────────────────────────────────────────');
  console.log('Migration Summary:');
  console.log(`  Total survey creators examined: ${surveyCreators.length}`);
  console.log(`  Successfully updated to 'researcher': ${updatedCount}`);
  console.log(`  Already tagged as 'researcher': ${alreadyResearcherCount}`);
  console.log(`  Retained existing non-null userType: ${otherTypeCount}`);
  console.log('  Accounts deleted: 0 (Strictly zero data loss)');
  console.log('──────────────────────────────────────────────\n');

  await mongoose.disconnect();
  console.log('✅ Database disconnected. Migration complete.');
}

if (require.main === module) {
  migrateSurveyCreators().catch((err) => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  });
}

module.exports = { migrateSurveyCreators };

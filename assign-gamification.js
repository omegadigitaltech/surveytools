require('dotenv').config();
const mongoose = require('mongoose');
const { UserMissionProgress, Mission } = require('./model/gamification');
const User = require('./model/user');

async function assign() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('Finding foluwaseyipeter450@gmail.com...');
    const user = await User.findOne({ email: 'foluwaseyipeter450@gmail.com' });

    if (!user) {
      console.log('User not found!');
      process.exit(1);
    }

    console.log(`Found user: ${user._id}`);

    const dummyMission = await Mission.findOne({ title: 'First Step' });
    if (!dummyMission) {
      console.log('Dummy mission not found!');
      process.exit(1);
    }

    const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(); endOfDay.setHours(23, 59, 59, 999);

    const existing = await UserMissionProgress.findOne({
      userId: user._id,
      missionId: dummyMission._id,
      periodStart: startOfDay
    });

    if (existing) {
      existing.completed = true;
      existing.rewardClaimed = false;
      await existing.save();
      console.log(`Progress ID: ${existing._id} (updated existing)`);
    } else {
      const progress = new UserMissionProgress({
        userId: user._id,
        missionId: dummyMission._id,
        currentValue: 1,
        completed: true,
        rewardClaimed: false,
        periodStart: startOfDay,
        periodEnd: endOfDay
      });
      await progress.save();
      console.log(`Progress ID: ${progress._id} (created new)`);
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

assign();

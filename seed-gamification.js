require('dotenv').config();
const mongoose = require('mongoose');
const { 
  LevelConfig, 
  VIPTierConfig, 
  Achievement, 
  BonusEvent, 
  Mission, 
  UserMissionProgress 
} = require('./model/gamification');
const User = require('./model/user');

async function seedGamification() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');

    // 1. Seed VIP Tiers
    console.log('Seeding VIP Tiers...');
    await VIPTierConfig.deleteMany({});
    await VIPTierConfig.insertMany([
      { tier: 'bronze', minPoints: 0, maxPoints: 999, conversionRate: 1, bonusOnRewards: 0, supportLevel: 'standard' },
      { tier: 'silver', minPoints: 1000, maxPoints: 4999, conversionRate: 1.2, bonusOnRewards: 10, supportLevel: 'standard' },
      { tier: 'gold', minPoints: 5000, maxPoints: 19999, conversionRate: 1.5, bonusOnRewards: 25, supportLevel: 'priority' },
      { tier: 'platinum', minPoints: 20000, maxPoints: 999999, conversionRate: 2, bonusOnRewards: 50, supportLevel: 'dedicated' }
    ]);

    // 2. Seed Level Configs
    console.log('Seeding Level Configs...');
    await LevelConfig.deleteMany({});
    await LevelConfig.insertMany([
      { level: 1, name: 'Novice', minXP: 0, maxXP: 499, benefits: ['Basic surveys'], surveyAccess: 'basic' },
      { level: 2, name: 'Explorer', minXP: 500, maxXP: 1999, benefits: ['Basic surveys', 'Daily spin'], surveyAccess: 'basic' },
      { level: 3, name: 'Master', minXP: 2000, maxXP: 9999, benefits: ['Premium surveys', 'Daily spin'], surveyAccess: 'premium' }
    ]);

    // 3. Seed some dummy Missions
    console.log('Seeding Missions...');
    await Mission.deleteMany({});
    const mission = await Mission.create({
      title: 'First Step',
      description: 'Test mission for claiming rewards',
      type: 'daily',
      category: 'login',
      targetValue: 1,
      xpReward: 50,
      pointsReward: 100,
      isActive: true
    });

    // 4. Assign this mission to all users as COMPLETED so you can test Claim Reward
    console.log('Assigning completed mission to all users...');
    const users = await User.find({}, '_id');
    const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(); endOfDay.setHours(23, 59, 59, 999);
    
    await UserMissionProgress.deleteMany({});
    
    const bulkOps = users.map(user => ({
      insertOne: {
        document: {
          userId: user._id,
          missionId: mission._id,
          currentValue: 1,
          completed: true,
          rewardClaimed: false,
          periodStart: startOfDay,
          periodEnd: endOfDay
        }
      }
    }));
    
    if (bulkOps.length > 0) {
      await UserMissionProgress.bulkWrite(bulkOps);
    }

    console.log('\n--- SEEDING COMPLETE ---');
    console.log(`Created ${bulkOps.length} UserMissionProgress entries.`);
    console.log(`\nTo test Claim Reward, you need a progressID. Pick one of the following valid IDs:`);
    
    // Print out 3 valid progress IDs and their user emails so the user knows which one matches their login
    const progresses = await UserMissionProgress.find().limit(3).populate('userId', 'email');
    progresses.forEach(p => {
      console.log(`- Progress ID: ${p._id} (belongs to user email: ${p.userId ? p.userId.email : 'unknown'})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedGamification();

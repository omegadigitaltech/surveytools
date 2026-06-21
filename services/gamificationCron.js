const { Mission, UserMissionProgress } = require('../model/gamification');
const User = require('../model/user');

const runDailyMissions = async () => {
  console.log('[CRON] Running Daily Gamification Mission Assignment...');
  try {
    const dailyMissions = await Mission.find({ isActive: true, type: 'daily' });
    if (dailyMissions.length === 0) return;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const users = await User.find({}, '_id');
    const bulkOps = [];
    
    for (const user of users) {
      for (const mission of dailyMissions) {
        bulkOps.push({
          updateOne: {
            filter: { userId: user._id, missionId: mission._id, periodStart: startOfDay },
            update: {
              $setOnInsert: {
                userId: user._id,
                missionId: mission._id,
                currentValue: 0,
                completed: false,
                rewardClaimed: false,
                periodStart: startOfDay,
                periodEnd: endOfDay
              }
            },
            upsert: true
          }
        });
      }
    }

    if (bulkOps.length > 0) {
      await UserMissionProgress.bulkWrite(bulkOps);
    }
    console.log(`[CRON] Successfully assigned ${dailyMissions.length} daily missions to ${users.length} users.`);
  } catch (error) {
    console.error('[CRON] Error assigning daily missions:', error);
  }
};

const initGamificationCron = () => {
  // Using setInterval as a lightweight node-cron alternative
  // Checks every minute
  setInterval(() => {
    const now = new Date();
    // Run at exactly midnight (00:00) server time
    if (now.getHours() === 0 && now.getMinutes() === 0) {
      runDailyMissions();
    }
  }, 60 * 1000);
  
  console.log('[CRON] Gamification scheduler initialized. Waiting for midnight.');
};

module.exports = initGamificationCron;

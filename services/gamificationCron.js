const cron = require('node-cron');
const { Mission, UserMissionProgress, UserGamification, LeaderboardEntry } = require('../model/gamification');
const User = require('../model/user');
const { createLogger } = require('../lib/logger');
const logger = createLogger('gamification-cron');

const runDailyMissions = async () => {
  logger.info('[CRON] Running Daily Gamification Mission Assignment...');
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
    logger.info(`[CRON] Successfully assigned ${dailyMissions.length} daily missions to ${users.length} users.`);
  } catch (error) {
    logger.error({ err: error }, '[CRON] Error assigning daily missions');
  }
};

const runWeeklyMissions = async () => {
  logger.info('[CRON] Running Weekly Gamification Mission Assignment...');
  try {
    const weeklyMissions = await Mission.find({ isActive: true, type: 'weekly' });
    if (weeklyMissions.length === 0) return;

    const startOfWeek = new Date();
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1); // Monday
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const users = await User.find({}, '_id');
    const bulkOps = [];
    
    for (const user of users) {
      for (const mission of weeklyMissions) {
        bulkOps.push({
          updateOne: {
            filter: { userId: user._id, missionId: mission._id, periodStart: startOfWeek },
            update: {
              $setOnInsert: {
                userId: user._id,
                missionId: mission._id,
                currentValue: 0,
                completed: false,
                rewardClaimed: false,
                periodStart: startOfWeek,
                periodEnd: endOfWeek
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
    logger.info(`[CRON] Successfully assigned ${weeklyMissions.length} weekly missions to ${users.length} users.`);
  } catch (error) {
    logger.error({ err: error }, '[CRON] Error assigning weekly missions');
  }
};

const resetDailySpins = async () => {
  logger.info('[CRON] Resetting Daily Spins...');
  try {
    const result = await UserGamification.updateMany(
      {},
      { $set: { spinsRemaining: 1 } }
    );
    logger.info(`[CRON] Reset daily spins for ${result.modifiedCount} users.`);
  } catch (error) {
    logger.error({ err: error }, '[CRON] Error resetting daily spins');
  }
};

const snapshotLeaderboard = async (period) => {
  logger.info(`[CRON] Generating ${period} Leaderboard Snapshot...`);
  try {
    const today = new Date();
    let periodKey = '';
    
    if (period === 'daily') {
      periodKey = today.toISOString().split('T')[0];
    } else if (period === 'weekly') {
      const year = today.getFullYear();
      const firstJan = new Date(year, 0, 1);
      const days = Math.floor((today - firstJan) / (24 * 60 * 60 * 1000));
      const weekNumber = Math.ceil((days + firstJan.getDay() + 1) / 7);
      periodKey = `${year}-W${weekNumber}`;
    }

    const topUsers = await UserGamification.find()
      .sort({ xp: -1 })
      .limit(100);

    const bulkOps = topUsers.map((u, index) => ({
      updateOne: {
        filter: { userId: u.userId, period, periodKey },
        update: {
          $set: {
            userId: u.userId,
            period,
            periodKey,
            xp: u.xp,
            points: u.totalPointsEarned,
            surveysCompleted: u.totalSurveysCompleted,
            rank: index + 1
          }
        },
        upsert: true
      }
    }));

    if (bulkOps.length > 0) {
      await LeaderboardEntry.bulkWrite(bulkOps);
    }
    logger.info(`[CRON] Successfully generated ${period} leaderboard snapshot for ${bulkOps.length} users.`);
  } catch (error) {
    logger.error({ err: error }, `[CRON] Error generating ${period} leaderboard snapshot`);
  }
};

const initGamificationCron = () => {
  // Run daily tasks at midnight
  cron.schedule('0 0 * * *', () => {
    runDailyMissions();
    resetDailySpins();
    snapshotLeaderboard('daily');
  });
  
  // Run weekly tasks at midnight on Monday
  cron.schedule('0 0 * * 1', () => {
    runWeeklyMissions();
    snapshotLeaderboard('weekly');
  });
  
  logger.info('[CRON] Gamification scheduler (node-cron) initialized.');
};

module.exports = initGamificationCron;

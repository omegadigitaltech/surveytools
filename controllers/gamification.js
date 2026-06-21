const {
  UserGamification,
  SpinHistory,
  Mission,
  UserMissionProgress,
  Achievement,
  LeaderboardEntry,
  XPTransaction,
  LevelConfig,
  VIPTierConfig,
} = require('../model/gamification');
const User = require('../model/user');
const mongoose = require('mongoose');

// ─── HELPER: GET OR CREATE GAMIFICATION PROFILE ─────────────────────────────
const getGamificationProfile = async (userId, session = null) => {
  let profile = await UserGamification.findOne({ userId }).session(session);
  if (!profile) {
    profile = new UserGamification({ userId });
    await profile.save({ session });
  }
  return profile;
};

// ─── GET DASHBOARD / PROFILE ──────────────────────────────────────────────────
const getGamificationDashboard = async (req, res, next) => {
  try {
    const userId = req.userId;
    const user = await User.findOne({ id: userId });
    if (!user) return res.status(404).json({ status: 'failure', msg: 'User not found' });

    const profile = await getGamificationProfile(user._id);
    const levelConfig = await LevelConfig.findOne({ level: profile.level }) || { name: 'Level ' + profile.level, benefits: [] };
    const nextLevelConfig = await LevelConfig.findOne({ level: profile.level + 1 });
    
    // Sync VIP Tier based on User pointBalance
    const vipTiers = await VIPTierConfig.find().sort({ minPoints: -1 });
    let currentTier = 'bronze';
    for (const tier of vipTiers) {
      if (user.pointBalance >= tier.minPoints) {
        currentTier = tier.tier;
        break;
      }
    }
    
    if (profile.vipTier !== currentTier) {
      profile.vipTier = currentTier;
      await profile.save();
    }

    // Active missions count
    const activeMissions = await UserMissionProgress.countDocuments({
      userId: user._id,
      completed: false,
      periodEnd: { $gte: new Date() }
    });

    res.status(200).json({
      status: 'success',
      data: {
        xp: profile.xp,
        level: profile.level,
        levelName: levelConfig.name,
        levelBenefits: levelConfig.benefits,
        nextLevelXP: nextLevelConfig ? nextLevelConfig.minXP : null,
        vipTier: profile.vipTier,
        currentStreak: profile.currentStreak,
        spinsRemaining: profile.spinsRemaining,
        pointBalance: user.pointBalance,
        activeMissionsCount: activeMissions
      }
    });
  } catch (error) {
    next(error);
  }
};

// ─── DAILY SPIN ──────────────────────────────────────────────────────────────
const spinWheel = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findOne({ id: req.userId }).session(session);
    if (!user) throw new Error('User not found');

    const profile = await getGamificationProfile(user._id, session);

    if (profile.spinsRemaining <= 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ status: 'failure', msg: 'No spins remaining for today' });
    }

    // Spin Logic / Probabilities
    const rand = Math.random();
    let result = '';
    let pointsAwarded = 0;
    let xpAwarded = 0;
    
    // Example fixed probabilities
    if (rand < 0.01) { result = 'jackpot'; pointsAwarded = 1000; xpAwarded = 500; }
    else if (rand < 0.05) { result = '2x_multiplier'; }
    else if (rand < 0.15) { result = 'speed_up'; }
    else if (rand < 0.30) { result = '150_points'; pointsAwarded = 150; }
    else if (rand < 0.50) { result = '100_points'; pointsAwarded = 100; }
    else if (rand < 0.70) { result = '50_points'; pointsAwarded = 50; }
    else { result = 'try_again'; }

    // Update Profile
    profile.spinsRemaining -= 1;
    profile.lastSpinDate = new Date();
    profile.totalSpins += 1;
    
    if (pointsAwarded > 0) {
      user.pointBalance += pointsAwarded;
      profile.totalPointsEarned += pointsAwarded;
    }
    
    if (xpAwarded > 0) {
      profile.xp += xpAwarded;
      profile.totalXPEarned += xpAwarded;
    }

    // Handle Boosts
    if (result === '2x_multiplier' || result === 'speed_up' || result === 'jackpot') {
       let boostType = result;
       if (result === '2x_multiplier') boostType = '2x_points';
       // Add boost valid for 24h
       profile.activeBoosts.push({
         type: boostType,
         expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
         multiplier: boostType === '2x_points' ? 2 : 1
       });
    }

    // Record History
    const history = new SpinHistory({
      userId: user._id,
      result,
      pointsAwarded,
      xpAwarded,
      boostApplied: ['2x_multiplier', 'speed_up', 'jackpot'].includes(result)
    });

    await user.save({ session });
    await profile.save({ session });
    await history.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      status: 'success',
      data: {
        result,
        pointsAwarded,
        xpAwarded,
        spinsRemaining: profile.spinsRemaining
      }
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

// ─── GET MISSIONS ─────────────────────────────────────────────────────────────
const getMissions = async (req, res, next) => {
  try {
    const user = await User.findOne({ id: req.userId });
    if (!user) return res.status(404).json({ status: 'failure', msg: 'User not found' });

    // In a real scenario, you'd have a cron job generating UserMissionProgress based on active Missions.
    // Here we just fetch active user missions.
    const missions = await UserMissionProgress.find({ 
      userId: user._id,
      periodEnd: { $gte: new Date() }
    }).populate('missionId');

    const formattedMissions = missions.map(m => ({
      id: m._id,
      title: m.missionId.title,
      description: m.missionId.description,
      type: m.missionId.type,
      currentValue: m.currentValue,
      targetValue: m.missionId.targetValue,
      completed: m.completed,
      rewardClaimed: m.rewardClaimed,
      xpReward: m.missionId.xpReward,
      pointsReward: m.missionId.pointsReward
    }));

    res.status(200).json({
      status: 'success',
      data: formattedMissions
    });
  } catch (error) {
    next(error);
  }
};

// ─── CLAIM MISSION REWARD ────────────────────────────────────────────────────
const claimMissionReward = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { missionProgressId } = req.params;
    const user = await User.findOne({ id: req.userId }).session(session);
    if (!user) throw new Error('User not found');

    const progress = await UserMissionProgress.findOne({
      _id: missionProgressId,
      userId: user._id
    }).populate('missionId').session(session);

    if (!progress) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ status: 'failure', msg: 'Mission progress not found' });
    }

    if (!progress.completed) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ status: 'failure', msg: 'Mission not completed yet' });
    }

    if (progress.rewardClaimed) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ status: 'failure', msg: 'Reward already claimed' });
    }

    const profile = await getGamificationProfile(user._id, session);
    const mission = progress.missionId;

    // Grant rewards
    if (mission.pointsReward > 0) {
      user.pointBalance += mission.pointsReward;
      profile.totalPointsEarned += mission.pointsReward;
    }
    
    if (mission.xpReward > 0) {
      profile.xp += mission.xpReward;
      profile.totalXPEarned += mission.xpReward;
    }

    progress.rewardClaimed = true;

    await progress.save({ session });
    await user.save({ session });
    await profile.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      status: 'success',
      msg: 'Reward claimed successfully',
      data: {
        pointsAwarded: mission.pointsReward,
        xpAwarded: mission.xpReward
      }
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

// ─── GET LEADERBOARD ──────────────────────────────────────────────────────────
const getLeaderboard = async (req, res, next) => {
  try {
    const { period = 'all_time' } = req.query; // daily, weekly, all_time
    
    // In a real app, 'all_time' could just query UserGamification directly for performance
    // or rely on aggregated LeaderboardEntry models
    
    let entries;
    if (period === 'all_time') {
      entries = await UserGamification.find()
        .sort({ xp: -1 })
        .limit(50)
        .populate('userId', 'fullname pic_url');
        
      entries = entries.map((e, index) => ({
        rank: index + 1,
        fullname: e.userId.fullname,
        pic_url: e.userId.pic_url,
        xp: e.xp,
        level: e.level
      }));
    } else {
      // Logic for daily/weekly would query LeaderboardEntry using periodKey
      // Mocking for now as it requires background aggregation jobs
      return res.status(501).json({ status: 'failure', msg: 'Periodic leaderboard not implemented yet. Use all_time' });
    }

    res.status(200).json({
      status: 'success',
      data: entries
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET VIP STATUS ───────────────────────────────────────────────────────────
const getVipStatus = async (req, res, next) => {
  try {
    const user = await User.findOne({ id: req.userId });
    if (!user) return res.status(404).json({ status: 'failure', msg: 'User not found' });

    const profile = await getGamificationProfile(user._id);
    const tiers = await VIPTierConfig.find().sort({ minPoints: 1 });
    
    const currentTierConfig = tiers.find(t => t.tier === profile.vipTier) || tiers[0];
    const nextTierConfig = tiers.find(t => t.minPoints > user.pointBalance);

    res.status(200).json({
      status: 'success',
      data: {
        currentTier: currentTierConfig.tier,
        benefits: {
          conversionRate: currentTierConfig.conversionRate,
          bonusOnRewards: currentTierConfig.bonusOnRewards,
          supportLevel: currentTierConfig.supportLevel
        },
        currentPoints: user.pointBalance,
        nextTier: nextTierConfig ? nextTierConfig.tier : null,
        pointsToNextTier: nextTierConfig ? (nextTierConfig.minPoints - user.pointBalance) : 0
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGamificationDashboard,
  spinWheel,
  getMissions,
  claimMissionReward,
  getLeaderboard,
  getVipStatus
};

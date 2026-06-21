const mongoose = require('mongoose');
const { Schema } = mongoose;

// ─── LEVEL CONFIG ─────────────────────────────────────────────────────────────
const LevelConfigSchema = new Schema({
  level: { type: Number, required: true, unique: true },
  name: { type: String, required: true },        // e.g. "Novice", "Explorer"
  minXP: { type: Number, required: true },
  maxXP: { type: Number, required: true },
  pointsMultiplier: { type: Number, default: 1.0 },
  benefits: [{ type: String }],                  // e.g. ["Basic surveys", "Daily spin wheel"]
  surveyAccess: {
    type: String,
    enum: ['basic', 'premium', 'exclusive', 'vip', 'all'],
    default: 'basic'
  },
  weeklyBonusMission: { type: Boolean, default: false },
  icon: { type: String, default: '' }
}, { timestamps: true });

// ─── VIP TIER CONFIG ──────────────────────────────────────────────────────────
const VIPTierConfigSchema = new Schema({
  tier: { type: String, required: true, unique: true, enum: ['bronze', 'silver', 'gold', 'platinum'] },
  minPoints: { type: Number, required: true },
  maxPoints: { type: Number, required: true },
  conversionRate: { type: Number, default: 1.0 }, // points -> reward multiplier
  bonusOnRewards: { type: Number, default: 0 },    // % bonus
  supportLevel: { type: String, enum: ['standard', 'priority', 'dedicated'], default: 'standard' },
  icon: { type: String, default: '' }
}, { timestamps: true });

// ─── USER GAMIFICATION PROFILE ────────────────────────────────────────────────
const UserGamificationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

  // XP & Level
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },

  // VIP Tier (based on pointBalance in User model)
  vipTier: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum'],
    default: 'bronze'
  },

  // Daily Streak
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastLoginDate: { type: Date, default: null },

  // Spin Wheel
  lastSpinDate: { type: Date, default: null },
  totalSpins: { type: Number, default: 0 },
  spinsRemaining: { type: Number, default: 1 },  // resets daily

  // Referrals
  referralCode: { type: String, unique: true, sparse: true },
  referredBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  referralCount: { type: Number, default: 0 },

  // Boosts
  activeBoosts: [{
    type: { type: String, enum: ['2x_points', '1.5x_points', 'speed_up', 'jackpot'] },
    expiresAt: { type: Date },
    multiplier: { type: Number, default: 1 }
  }],

  // Aggregates
  totalSurveysCompleted: { type: Number, default: 0 },
  totalPointsEarned: { type: Number, default: 0 },
  totalXPEarned: { type: Number, default: 0 },

  // Achievements unlocked
  achievements: [{
    achievementId: { type: Schema.Types.ObjectId, ref: 'Achievement' },
    unlockedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

// ─── DAILY SPIN RESULT ────────────────────────────────────────────────────────
const SpinHistorySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  result: {
    type: String,
    enum: ['try_again', 'jackpot', '2x_multiplier', '1x_multiplier', '50_points', '100_points', '150_points', 'speed_up'],
    required: true
  },
  pointsAwarded: { type: Number, default: 0 },
  xpAwarded: { type: Number, default: 0 },
  boostApplied: { type: Boolean, default: false },
  spinDate: { type: Date, default: Date.now }
}, { timestamps: true });

// ─── MISSION / CHALLENGE ─────────────────────────────────────────────────────
const MissionSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['daily', 'weekly'], required: true },
  category: {
    type: String,
    enum: ['surveys', 'streak', 'referral', 'points', 'categories', 'login'],
    required: true
  },
  targetValue: { type: Number, required: true }, // e.g. 3 (surveys), 5 (login days), 1 (referral)
  xpReward: { type: Number, default: 0 },
  pointsReward: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  resetCron: { type: String, default: '0 0 * * *' } // daily midnight by default
}, { timestamps: true });

// ─── USER MISSION PROGRESS ────────────────────────────────────────────────────
const UserMissionProgressSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  missionId: { type: Schema.Types.ObjectId, ref: 'Mission', required: true },
  currentValue: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date, default: null },
  rewardClaimed: { type: Boolean, default: false },
  periodStart: { type: Date, required: true }, // start of daily/weekly window
  periodEnd: { type: Date, required: true }
}, { timestamps: true });

UserMissionProgressSchema.index({ userId: 1, missionId: 1, periodStart: 1 }, { unique: true });

// ─── ACHIEVEMENT ─────────────────────────────────────────────────────────────
const AchievementSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, default: '' },
  category: { type: String, enum: ['surveys', 'streak', 'referral', 'level', 'points', 'spin'], required: true },
  triggerValue: { type: Number, required: true }, // e.g. 10 surveys completed
  xpReward: { type: Number, default: 0 },
  pointsReward: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// ─── LEADERBOARD SNAPSHOT ─────────────────────────────────────────────────────
const LeaderboardEntrySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  period: { type: String, enum: ['daily', 'weekly', 'all_time'], required: true },
  periodKey: { type: String, required: true }, // e.g. "2025-W21" or "2025-05-26"
  xp: { type: Number, default: 0 },
  points: { type: Number, default: 0 },
  surveysCompleted: { type: Number, default: 0 },
  rank: { type: Number, default: 0 }
}, { timestamps: true });

LeaderboardEntrySchema.index({ period: 1, periodKey: 1, xp: -1 });
LeaderboardEntrySchema.index({ userId: 1, period: 1, periodKey: 1 }, { unique: true });

// ─── XP TRANSACTION LOG ───────────────────────────────────────────────────────
const XPTransactionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },  // positive = gain, negative = spend
  source: {
    type: String,
    enum: ['survey_completion', 'daily_login', 'mission_complete', 'referral', 'spin_reward', 'achievement', 'level_up_bonus', 'admin_grant'],
    required: true
  },
  referenceId: { type: Schema.Types.ObjectId, default: null }, // survey or mission ID
  description: { type: String, default: '' },
  balanceBefore: { type: Number, required: true },
  balanceAfter: { type: Number, required: true }
}, { timestamps: true });

// ─── BONUS EVENT (e.g. 2x Points Boost) ─────────────────────────────────────
const BonusEventSchema = new Schema({
  title: { type: String, required: true },         // "2x Points Boost Active"
  description: { type: String, required: true },
  multiplier: { type: Number, default: 2 },
  targetType: { type: String, enum: ['all_users', 'specific_level', 'specific_tier'], default: 'all_users' },
  targetValue: { type: String, default: null },    // level number or tier name
  startAt: { type: Date, required: true },
  endAt: { type: Date, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Exports
const LevelConfig = mongoose.model('LevelConfig', LevelConfigSchema);
const VIPTierConfig = mongoose.model('VIPTierConfig', VIPTierConfigSchema);
const UserGamification = mongoose.model('UserGamification', UserGamificationSchema);
const SpinHistory = mongoose.model('SpinHistory', SpinHistorySchema);
const Mission = mongoose.model('Mission', MissionSchema);
const UserMissionProgress = mongoose.model('UserMissionProgress', UserMissionProgressSchema);
const Achievement = mongoose.model('Achievement', AchievementSchema);
const LeaderboardEntry = mongoose.model('LeaderboardEntry', LeaderboardEntrySchema);
const XPTransaction = mongoose.model('XPTransaction', XPTransactionSchema);
const BonusEvent = mongoose.model('BonusEvent', BonusEventSchema);

module.exports = {
  LevelConfig,
  VIPTierConfig,
  UserGamification,
  SpinHistory,
  Mission,
  UserMissionProgress,
  Achievement,
  LeaderboardEntry,
  XPTransaction,
  BonusEvent
};

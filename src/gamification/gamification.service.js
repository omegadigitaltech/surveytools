'use strict';

const { AppError } = require('../../lib/app-error');
const { createLogger } = require('../../lib/logger');
const { v4: uuidv4 } = require('uuid');

const log = createLogger('gamification');

/**
 * Factory that creates the gamification service for new user-facing features.
 *
 * @param {{
 *   LevelConfig: object,
 *   Achievement: object,
 *   UserGamification: object,
 *   SpinHistory: object,
 *   User: object,
 * }} models - Injected Mongoose models
 * @returns {object} Service methods
 */
function createGamificationService({ LevelConfig, Achievement, UserGamification, SpinHistory, User }) {

  // ─── LEVELS LADDER ───────────────────────────────────────────────────────────

  /**
   * Returns the full levels ladder sorted by level number ascending.
   * Used by the frontend to render a progress map.
   *
   * @returns {Promise<Array<object>>} Sorted array of level config documents
   */
  async function getLevels() {
    const levels = await LevelConfig.find().sort({ level: 1 }).lean();
    log.info({ count: levels.length }, 'levels ladder fetched');
    return levels;
  }

  // ─── ACHIEVEMENTS ─────────────────────────────────────────────────────────────

  /**
   * Returns all active achievements with a flag indicating whether the
   * authenticated user has already unlocked each one.
   *
   * @param {string} mongoUserId - The user's MongoDB _id (ObjectId string)
   * @returns {Promise<Array<object>>} List of achievements with `unlockedAt` or null
   */
  async function getAchievements(mongoUserId) {
    const [allAchievements, profile] = await Promise.all([
      Achievement.find({ isActive: true }).lean(),
      UserGamification.findOne({ userId: mongoUserId }).select('achievements').lean(),
    ]);

    const unlockedMap = new Map(
      (profile?.achievements || []).map(a => [a.achievementId.toString(), a.unlockedAt])
    );

    const result = allAchievements.map(achievement => ({
      id:           achievement._id,
      title:        achievement.title,
      description:  achievement.description,
      icon:         achievement.icon,
      category:     achievement.category,
      triggerValue: achievement.triggerValue,
      xpReward:     achievement.xpReward,
      pointsReward: achievement.pointsReward,
      unlocked:     unlockedMap.has(achievement._id.toString()),
      unlockedAt:   unlockedMap.get(achievement._id.toString()) || null,
    }));

    log.info({ mongoUserId, total: allAchievements.length, unlocked: unlockedMap.size }, 'achievements fetched');
    return result;
  }

  // ─── SPIN HISTORY ─────────────────────────────────────────────────────────────

  /**
   * Returns a paginated list of the user's spin history, most recent first.
   *
   * @param {string} mongoUserId - The user's MongoDB _id (ObjectId string)
   * @param {number} page  - Page number (1-indexed)
   * @param {number} limit - Records per page
   * @returns {Promise<{ data: Array<object>, total: number, page: number, totalPages: number }>}
   */
  async function getSpinHistory(mongoUserId, page, limit) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      SpinHistory.find({ userId: mongoUserId })
        .sort({ spinDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      SpinHistory.countDocuments({ userId: mongoUserId }),
    ]);

    log.info({ mongoUserId, page, limit, total }, 'spin history fetched');
    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ─── REFERRALS ────────────────────────────────────────────────────────────────

  /**
   * Returns the user's referral info. If they don't have a referral code yet,
   * one is generated and saved before returning.
   *
   * @param {string} mongoUserId - The user's MongoDB _id (ObjectId string)
   * @returns {Promise<object>} Referral data including code, count, and referred-by info
   */
  async function getReferrals(mongoUserId) {
    let profile = await UserGamification.findOne({ userId: mongoUserId })
      .select('referralCode referredBy referralCount')
      .populate('referredBy', 'fullname');

    if (!profile) {
      throw new AppError(404, 'Gamification profile not found');
    }

    // Generate a referral code if one doesn't exist yet
    if (!profile.referralCode) {
      profile.referralCode = uuidv4().replace(/-/g, '').slice(0, 10).toUpperCase();
      await profile.save();
      log.info({ mongoUserId }, 'referral code generated');
    }

    return {
      referralCode:   profile.referralCode,
      referralCount:  profile.referralCount,
      referredBy:     profile.referredBy
        ? { fullname: profile.referredBy.fullname }
        : null,
    };
  }

  return {
    getLevels,
    getAchievements,
    getSpinHistory,
    getReferrals,
  };
}

module.exports = { createGamificationService };

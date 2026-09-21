'use strict';

const { AppError } = require('../../lib/app-error');
const { createLogger } = require('../../lib/logger');

const log = createLogger('admin-gamification');

/**
 * Factory that creates the admin gamification service.
 *
 * @param {{
 *   Achievement: object,
 *   LevelConfig: object,
 *   VIPTierConfig: object,
 *   BonusEvent: object,
 * }} models - Injected Mongoose models
 * @returns {object} Service methods
 */
function createAdminGamificationService({ Achievement, LevelConfig, VIPTierConfig, BonusEvent }) {

  // ─── ACHIEVEMENTS ─────────────────────────────────────────────────────────────

  /**
   * Creates a new Achievement document.
   *
   * @param {object} data - Validated achievement data from the Zod schema
   * @returns {Promise<object>} The newly created Achievement document
   */
  async function createAchievement(data) {
    const existing = await Achievement.findOne({ title: data.title });
    if (existing) throw new AppError(409, `Achievement "${data.title}" already exists`);

    const achievement = new Achievement(data);
    await achievement.save();
    log.info({ achievementId: achievement._id, title: achievement.title }, 'achievement created');
    return achievement;
  }

  // ─── LEVELS ───────────────────────────────────────────────────────────────────

  /**
   * Returns all level configurations sorted by level number ascending.
   *
   * @returns {Promise<Array<object>>} Sorted array of LevelConfig documents
   */
  async function getLevels() {
    const levels = await LevelConfig.find().sort({ level: 1 }).lean();
    log.info({ count: levels.length }, 'admin fetched levels');
    return levels;
  }

  // ─── VIP TIERS ────────────────────────────────────────────────────────────────

  /**
   * Returns all VIP tier configurations sorted by minPoints ascending.
   *
   * @returns {Promise<Array<object>>} Sorted array of VIPTierConfig documents
   */
  async function getVipTiers() {
    const tiers = await VIPTierConfig.find().sort({ minPoints: 1 }).lean();
    log.info({ count: tiers.length }, 'admin fetched VIP tiers');
    return tiers;
  }

  // ─── BONUS EVENTS ─────────────────────────────────────────────────────────────

  /**
   * Creates a new BonusEvent document.
   *
   * @param {object} data - Validated bonus event data from the Zod schema
   * @returns {Promise<object>} The newly created BonusEvent document
   */
  async function createBonusEvent(data) {
    const bonusEvent = new BonusEvent(data);
    await bonusEvent.save();
    log.info({ bonusEventId: bonusEvent._id, title: bonusEvent.title }, 'bonus event created');
    return bonusEvent;
  }

  /**
   * Returns all bonus events sorted by start date descending (most recent first).
   *
   * @returns {Promise<Array<object>>} Sorted array of BonusEvent documents
   */
  async function getBonusEvents() {
    const events = await BonusEvent.find().sort({ startAt: -1 }).lean();
    log.info({ count: events.length }, 'admin fetched bonus events');
    return events;
  }

  return {
    createAchievement,
    getLevels,
    getVipTiers,
    createBonusEvent,
    getBonusEvents,
  };
}

module.exports = { createAdminGamificationService };

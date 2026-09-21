'use strict';

const { AppError } = require('../../lib/app-error');
const { createAchievementSchema, createBonusEventSchema } = require('./admin-gamification.schema');

/**
 * Factory that creates thin admin gamification controller functions.
 * Controllers validate input via Zod, call the service, and format the HTTP response.
 * They never contain business logic.
 *
 * @param {{ service: object }} deps - Injected admin gamification service
 * @returns {object} Controller functions
 */
function createAdminGamificationController({ service }) {

  /**
   * POST /admin/gamification/achievements
   * Creates a new Achievement that users can unlock.
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  async function createAchievement(req, res, next) {
    try {
      const parsed = createAchievementSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(400, parsed.error.issues.map(e => e.message).join(', '));
      }
      const achievement = await service.createAchievement(parsed.data);
      res.status(201).json({ status: 'success', data: achievement });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /admin/gamification/levels
   * Lists all level configurations sorted by level number.
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  async function getLevels(req, res, next) {
    try {
      const levels = await service.getLevels();
      res.status(200).json({ status: 'success', data: levels });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /admin/gamification/vip
   * Lists all VIP tier configurations sorted by minimum points.
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  async function getVipTiers(req, res, next) {
    try {
      const tiers = await service.getVipTiers();
      res.status(200).json({ status: 'success', data: tiers });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /admin/gamification/bonus-events
   * Creates a new BonusEvent (e.g. a weekend 2x points boost).
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  async function createBonusEvent(req, res, next) {
    try {
      const parsed = createBonusEventSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(400, parsed.error.issues.map(e => e.message).join(', '));
      }
      const bonusEvent = await service.createBonusEvent(parsed.data);
      res.status(201).json({ status: 'success', data: bonusEvent });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /admin/gamification/bonus-events
   * Lists all bonus events, most recently started first.
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  async function getBonusEvents(req, res, next) {
    try {
      const events = await service.getBonusEvents();
      res.status(200).json({ status: 'success', data: events });
    } catch (err) {
      next(err);
    }
  }

  return {
    createAchievement,
    getLevels,
    getVipTiers,
    createBonusEvent,
    getBonusEvents,
  };
}

module.exports = { createAdminGamificationController };

'use strict';

const { AppError } = require('../../lib/app-error');
const { getSpinHistorySchema } = require('./gamification.schema');
const User = require('../../model/user');

/**
 * Factory that creates thin controller functions for new gamification endpoints.
 * Controllers validate input, resolve the User, call the service, and format the HTTP response.
 * They never contain business logic.
 *
 * @param {{ service: object }} deps - Injected service instance
 * @returns {object} Controller functions
 */
function createGamificationController({ service }) {

  /**
   * GET /gamification/levels
   * Returns the full levels ladder so users can see XP thresholds per level.
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
   * GET /gamification/achievements
   * Returns all achievements with an `unlocked` flag for the requesting user.
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  async function getAchievements(req, res, next) {
    try {
      const user = await User.findOne({ id: req.userId });
      if (!user) throw new AppError(404, 'User not found');

      const achievements = await service.getAchievements(user._id.toString());
      res.status(200).json({ status: 'success', data: achievements });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /gamification/spin/history
   * Returns a paginated list of the requesting user's spin wheel history.
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  async function getSpinHistory(req, res, next) {
    try {
      const parsed = getSpinHistorySchema.safeParse(req.query);
      if (!parsed.success) {
        throw new AppError(400, parsed.error.errors.map(e => e.message).join(', '));
      }

      const user = await User.findOne({ id: req.userId });
      if (!user) throw new AppError(404, 'User not found');

      const { page, limit } = parsed.data;
      const result = await service.getSpinHistory(user._id.toString(), page, limit);
      res.status(200).json({ status: 'success', ...result });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /gamification/referrals
   * Returns the user's referral code, count, and who referred them (if any).
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  async function getReferrals(req, res, next) {
    try {
      const user = await User.findOne({ id: req.userId });
      if (!user) throw new AppError(404, 'User not found');

      const referrals = await service.getReferrals(user._id.toString());
      res.status(200).json({ status: 'success', data: referrals });
    } catch (err) {
      next(err);
    }
  }

  return {
    getLevels,
    getAchievements,
    getSpinHistory,
    getReferrals,
  };
}

module.exports = { createGamificationController };

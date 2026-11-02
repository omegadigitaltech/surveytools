'use strict';

const { createLogger } = require('../../lib/logger');

const log = createLogger('boost-resolver');

/**
 * Resolves the effective points multiplier for a user at the time of survey submission.
 *
 * Checks two independent boost sources in order:
 *   1. User-level activeBoosts on their UserGamification profile (awarded via spin wheel).
 *   2. Platform-wide BonusEvents created by admins (e.g. weekend 2x campaigns).
 *
 * The highest multiplier found across both sources wins. If no active boost applies,
 * returns 1 (no change to base points).
 *
 * @param {object} params
 * @param {object} params.UserGamification - Mongoose model for user gamification profiles
 * @param {object} params.BonusEvent - Mongoose model for admin-created bonus events
 * @param {object} params.user - The Mongoose user document (must have _id field)
 * @returns {Promise<number>} The effective multiplier (>= 1)
 */
async function resolveBoostMultiplier({ UserGamification, BonusEvent, user }) {
  const now = new Date();
  let multiplier = 1;

  try {
    // Check user-level activeBoosts (e.g. 2x_points from spin wheel)
    const profile = await UserGamification.findOne({ userId: user._id }).lean();
    if (profile && Array.isArray(profile.activeBoosts)) {
      for (const boost of profile.activeBoosts) {
        if (
          boost.type === '2x_points' &&
          boost.multiplier > 1 &&
          boost.expiresAt &&
          new Date(boost.expiresAt) > now
        ) {
          if (boost.multiplier > multiplier) {
            multiplier = boost.multiplier;
            log.info({ userId: user._id, boostType: boost.type, multiplier }, 'user-level boost applied');
          }
        }
      }
    }

    // Check platform-wide BonusEvents (admin-created campaigns)
    const activeEvents = await BonusEvent.find({
      isActive: true,
      startAt: { $lte: now },
      endAt: { $gte: now },
    }).lean();

    for (const event of activeEvents) {
      if (event.multiplier > multiplier) {
        multiplier = event.multiplier;
        log.info({ userId: user._id, eventId: event._id, multiplier }, 'platform bonus event applied');
      }
    }
  } catch (err) {
    // Boost resolution is non-critical — a failure here must never block point award.
    // Log the error and fall back to the default multiplier of 1.
    log.error({ err, userId: user._id }, 'boost resolution failed; defaulting to multiplier 1');
    return 1;
  }

  return multiplier;
}

module.exports = { resolveBoostMultiplier };

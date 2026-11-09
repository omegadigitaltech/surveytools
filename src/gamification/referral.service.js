'use strict';

const { UserGamification, XPTransaction } = require('../../model/gamification');
const User = require('../../model/user');
const { AppError } = require('../../lib/app-error');
const { createLogger } = require('../../lib/logger');

const log = createLogger('referral-service');

// ─── REWARD CONSTANTS ─────────────────────────────────────────────────────────
const REFERRER_XP     = 50;   // XP awarded to the person who shared their code
const REFERRER_POINTS = 100;  // Points awarded to the person who shared their code
const REFEREE_XP      = 20;   // XP signup bonus for the person who used a code

/**
 * Pre-validates a referral code before user creation.
 * Returns the referrer's gamification profile if the code is valid, or throws.
 *
 * Call this BEFORE creating the new user so we can bail out early if the code
 * is bad — avoiding orphaned user records.
 *
 * @param {string} referralCode         - Raw code from request body (case-insensitive)
 * @returns {Promise<object>}            The referrer's UserGamification document
 * @throws {AppError} 400 if code is not found
 */
async function validateReferralCode(referralCode) {
  if (!referralCode || typeof referralCode !== 'string') {
    return null;
  }

  const code = referralCode.trim().toUpperCase();
  if (!code) return null;

  const referrerProfile = await UserGamification.findOne({ referralCode: code });

  if (!referrerProfile) {
    throw new AppError(
      400,
      `Referral code "${referralCode}" is not valid. Please double-check the code and try again, or leave it blank to sign up without one.`
    );
  }

  log.info({ referralCode: code }, 'referral code pre-validated');
  return referrerProfile;
}

/**
 * Applies a referral after both the new user and their gamification profile
 * have been created. Assumes the code was already validated by validateReferralCode().
 *
 * Rewards:
 *   - Referrer: +${REFERRER_XP} XP, +${REFERRER_POINTS} points
 *   - New user (referee): +${REFEREE_XP} XP signup bonus
 *
 * @param {object} referrerProfile  - UserGamification document of the referrer
 * @param {object} newUserProfile   - UserGamification document of the new user (freshly created)
 * @param {string} newUserMongoId   - MongoDB _id string of the new user
 * @returns {Promise<void>}
 * @throws {AppError} 400 if self-referral is detected
 */
async function applyReferralRewards(referrerProfile, newUserProfile, newUserMongoId) {
  // Self-referral guard (edge case: pre-validation can't catch this since user didn't exist yet)
  if (referrerProfile.userId.toString() === newUserMongoId.toString()) {
    throw new AppError(400, 'You cannot use your own referral code.');
  }

  // ── Reward the new user (referee) ───────────────────────────────────────────
  const refereeBefore = newUserProfile.xp || 0;
  newUserProfile.referredBy = referrerProfile.userId;
  newUserProfile.xp = (newUserProfile.xp || 0) + REFEREE_XP;
  newUserProfile.totalXPEarned = (newUserProfile.totalXPEarned || 0) + REFEREE_XP;
  if (typeof newUserProfile.save === 'function') {
    await newUserProfile.save();
  }

  await XPTransaction.create({
    userId:        newUserProfile.userId,
    amount:        REFEREE_XP,
    source:        'referral',
    description:   'Referral signup bonus — joined using a referral code',
    balanceBefore: refereeBefore,
    balanceAfter:  newUserProfile.xp,
  });

  // ── Reward the referrer ──────────────────────────────────────────────────────
  const referrerBefore = referrerProfile.xp || 0;
  referrerProfile.referralCount = (referrerProfile.referralCount || 0) + 1;
  referrerProfile.xp = (referrerProfile.xp || 0) + REFERRER_XP;
  referrerProfile.totalXPEarned = (referrerProfile.totalXPEarned || 0) + REFERRER_XP;
  if (typeof referrerProfile.save === 'function') {
    await referrerProfile.save();
  }

  // Award points to the referrer's User.pointBalance
  await User.findByIdAndUpdate(referrerProfile.userId, {
    $inc: { pointBalance: REFERRER_POINTS }
  });

  await XPTransaction.create({
    userId:        referrerProfile.userId,
    amount:        REFERRER_XP,
    source:        'referral',
    description:   'Referral reward — a new user signed up with your code',
    balanceBefore: referrerBefore,
    balanceAfter:  referrerProfile.xp,
  });

  log.info({
    newUserId:  newUserMongoId,
    referrerId: referrerProfile.userId.toString(),
    referrerXP: REFERRER_XP,
    referrerPoints: REFERRER_POINTS,
    refereeXP:  REFEREE_XP,
  }, 'referral rewards applied');
}

module.exports = {
  validateReferralCode,
  applyReferralRewards,
  REFERRER_XP,
  REFERRER_POINTS,
  REFEREE_XP,
};


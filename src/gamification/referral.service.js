'use strict';

const mongoose = require('mongoose');
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
 * Guards:
 *   - Self-referral: throws 400 if referrer and new user are the same person
 *   - Already referred: throws 400 if the new user already has a referredBy set
 *
 * Rewards (all-or-nothing inside a Mongo transaction):
 *   - Referrer: +${REFERRER_XP} XP, +${REFERRER_POINTS} points
 *   - New user (referee): +${REFEREE_XP} XP signup bonus
 *
 * @param {object} referrerProfile  - UserGamification document of the referrer
 * @param {object} newUserProfile   - UserGamification document of the new user (freshly created)
 * @param {string} newUserMongoId   - MongoDB _id string of the new user
 * @returns {Promise<void>}
 * @throws {AppError} 400 if self-referral or already-referred is detected
 */
async function applyReferralRewards(referrerProfile, newUserProfile, newUserMongoId) {
  // ── Guard: self-referral ────────────────────────────────────────────────────
  // Edge case: pre-validation can't catch this since the user didn't exist yet
  if (referrerProfile.userId.toString() === newUserMongoId.toString()) {
    throw new AppError(400, 'You cannot use your own referral code.');
  }

  // ── Guard: already referred ─────────────────────────────────────────────────
  // Prevents a user from claiming referral rewards more than once
  if (newUserProfile.referredBy) {
    throw new AppError(
      400,
      'You have already used a referral code. Only one referral code can be applied per account.'
    );
  }

  // ── All-or-nothing transaction ───────────────────────────────────────────────
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Reward the new user (referee)
    const refereeBefore = newUserProfile.xp || 0;
    const refereeXPAfter = refereeBefore + REFEREE_XP;

    await UserGamification.findByIdAndUpdate(
      newUserProfile._id,
      {
        $set:  { referredBy: referrerProfile.userId },
        $inc:  { xp: REFEREE_XP, totalXPEarned: REFEREE_XP },
      },
      { session }
    );

    await XPTransaction.create(
      [{
        userId:        newUserProfile.userId,
        amount:        REFEREE_XP,
        source:        'referral',
        description:   'Referral signup bonus — joined using a referral code',
        balanceBefore: refereeBefore,
        balanceAfter:  refereeXPAfter,
      }],
      { session }
    );

    // Reward the referrer
    const referrerBefore = referrerProfile.xp || 0;
    const referrerXPAfter = referrerBefore + REFERRER_XP;

    await UserGamification.findByIdAndUpdate(
      referrerProfile._id,
      { $inc: { referralCount: 1, xp: REFERRER_XP, totalXPEarned: REFERRER_XP } },
      { session }
    );

    await User.findByIdAndUpdate(
      referrerProfile.userId,
      { $inc: { pointBalance: REFERRER_POINTS } },
      { session }
    );

    await XPTransaction.create(
      [{
        userId:        referrerProfile.userId,
        amount:        REFERRER_XP,
        source:        'referral',
        description:   'Referral reward — a new user signed up with your code',
        balanceBefore: referrerBefore,
        balanceAfter:  referrerXPAfter,
      }],
      { session }
    );

    await session.commitTransaction();

    log.info({
      newUserId:      newUserMongoId,
      referrerId:     referrerProfile.userId.toString(),
      referrerXP:     REFERRER_XP,
      referrerPoints: REFERRER_POINTS,
      refereeXP:      REFEREE_XP,
    }, 'referral rewards applied');

  } catch (err) {
    await session.abortTransaction();
    log.error({ err, newUserMongoId }, 'referral rewards transaction aborted');
    throw err;
  } finally {
    session.endSession();
  }
}

module.exports = {
  validateReferralCode,
  applyReferralRewards,
  REFERRER_XP,
  REFERRER_POINTS,
  REFEREE_XP,
};


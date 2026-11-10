'use strict';

const {
  validateReferralCode,
  applyReferralRewards,
  REFERRER_XP,
  REFERRER_POINTS,
  REFEREE_XP,
} = require('../../src/gamification/referral.service');
const { UserGamification, XPTransaction } = require('../../model/gamification');
const User = require('../../model/user');

jest.mock('../../model/gamification');
jest.mock('../../model/user');
// Extend the real mongoose with a mockable startSession so models still load correctly
const mongoose = require('mongoose');
jest.spyOn(mongoose, 'startSession');

describe('Referral Service — validateReferralCode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null if referralCode is not provided or empty', async () => {
    expect(await validateReferralCode(null)).toBeNull();
    expect(await validateReferralCode('')).toBeNull();
    expect(await validateReferralCode('   ')).toBeNull();
    expect(UserGamification.findOne).not.toHaveBeenCalled();
  });

  it('finds and returns the referrer gamification profile (case-insensitive, trimmed)', async () => {
    const mockProfile = { referralCode: 'ABC1234567', userId: 'referrer_mongo_1' };
    UserGamification.findOne.mockResolvedValue(mockProfile);

    const result = await validateReferralCode('  abc1234567  ');

    expect(UserGamification.findOne).toHaveBeenCalledWith({ referralCode: 'ABC1234567' });
    expect(result).toBe(mockProfile);
  });

  it('throws AppError(400) with helpful message if referral code does not exist', async () => {
    UserGamification.findOne.mockResolvedValue(null);

    await expect(validateReferralCode('INVALID123')).rejects.toMatchObject({
      status: 400,
      message: expect.stringContaining('Referral code "INVALID123" is not valid'),
    });
  });
});

describe('Referral Service — applyReferralRewards', () => {
  const referrerMongoId = '507f1f77bcf86cd799439011';
  const newUserId = '507f1f77bcf86cd799439022';

  let mockSession;
  let mockReferrerProfile;
  let mockNewUserProfile;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock mongoose session / transaction
    mockSession = {
      startTransaction: jest.fn(),
      commitTransaction: jest.fn().mockResolvedValue(undefined),
      abortTransaction:  jest.fn().mockResolvedValue(undefined),
      endSession:        jest.fn(),
    };
    mongoose.startSession.mockResolvedValue(mockSession);

    mockReferrerProfile = {
      _id:   'referrer_doc_id',
      userId: { toString: () => referrerMongoId },
      xp: 150,
      totalXPEarned: 150,
      referralCount: 2,
    };

    mockNewUserProfile = {
      _id:   'newuser_doc_id',
      userId: { toString: () => newUserId },
      xp: 0,
      totalXPEarned: 0,
      referredBy: null,
    };

    UserGamification.findByIdAndUpdate = jest.fn().mockResolvedValue(true);
    XPTransaction.create               = jest.fn().mockResolvedValue(true);
    User.findByIdAndUpdate             = jest.fn().mockResolvedValue(true);
  });

  it('throws AppError(400) if user attempts to use their own referral code', async () => {
    const sameUserId = '507f1f77bcf86cd799439011';
    mockReferrerProfile.userId = { toString: () => sameUserId };

    await expect(
      applyReferralRewards(mockReferrerProfile, mockNewUserProfile, sameUserId)
    ).rejects.toMatchObject({
      status: 400,
      message: 'You cannot use your own referral code.',
    });

    // No session should be started — guard fires before any DB work
    expect(mongoose.startSession).not.toHaveBeenCalled();
  });

  it('throws AppError(400) if the new user already has a referredBy set', async () => {
    mockNewUserProfile.referredBy = 'some_other_referrer_id';

    await expect(
      applyReferralRewards(mockReferrerProfile, mockNewUserProfile, newUserId)
    ).rejects.toMatchObject({
      status: 400,
      message: expect.stringContaining('already used a referral code'),
    });

    // No session started — guard fires before any DB work
    expect(mongoose.startSession).not.toHaveBeenCalled();
  });

  it('awards rewards inside a transaction and commits on success', async () => {
    await applyReferralRewards(mockReferrerProfile, mockNewUserProfile, newUserId);

    // Transaction lifecycle
    expect(mockSession.startTransaction).toHaveBeenCalledTimes(1);
    expect(mockSession.commitTransaction).toHaveBeenCalledTimes(1);
    expect(mockSession.abortTransaction).not.toHaveBeenCalled();
    expect(mockSession.endSession).toHaveBeenCalledTimes(1);

    // Referee gamif update
    expect(UserGamification.findByIdAndUpdate).toHaveBeenCalledWith(
      mockNewUserProfile._id,
      {
        $set: { referredBy: mockReferrerProfile.userId },
        $inc: { xp: REFEREE_XP, totalXPEarned: REFEREE_XP },
      },
      { session: mockSession }
    );

    // Referrer gamif update
    expect(UserGamification.findByIdAndUpdate).toHaveBeenCalledWith(
      mockReferrerProfile._id,
      { $inc: { referralCount: 1, xp: REFERRER_XP, totalXPEarned: REFERRER_XP } },
      { session: mockSession }
    );

    // Referrer point balance
    expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
      mockReferrerProfile.userId,
      { $inc: { pointBalance: REFERRER_POINTS } },
      { session: mockSession }
    );

    // Two XP transaction records — array form required for Mongo session support
    expect(XPTransaction.create).toHaveBeenCalledTimes(2);
    expect(XPTransaction.create).toHaveBeenCalledWith(
      [expect.objectContaining({ userId: mockNewUserProfile.userId, amount: REFEREE_XP, source: 'referral' })],
      { session: mockSession }
    );
    expect(XPTransaction.create).toHaveBeenCalledWith(
      [expect.objectContaining({ userId: mockReferrerProfile.userId, amount: REFERRER_XP, source: 'referral' })],
      { session: mockSession }
    );
  });

  it('aborts the transaction and rethrows if any DB operation fails', async () => {
    UserGamification.findByIdAndUpdate.mockRejectedValueOnce(new Error('DB timeout'));

    await expect(
      applyReferralRewards(mockReferrerProfile, mockNewUserProfile, newUserId)
    ).rejects.toThrow('DB timeout');

    expect(mockSession.abortTransaction).toHaveBeenCalledTimes(1);
    expect(mockSession.commitTransaction).not.toHaveBeenCalled();
    expect(mockSession.endSession).toHaveBeenCalledTimes(1);
  });
});

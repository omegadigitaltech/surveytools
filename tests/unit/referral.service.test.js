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

  let mockReferrerProfile;
  let mockNewUserProfile;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReferrerProfile = {
      userId: { toString: () => referrerMongoId },
      xp: 150,
      totalXPEarned: 150,
      referralCount: 2,
      save: jest.fn().mockResolvedValue(true),
    };

    mockNewUserProfile = {
      userId: { toString: () => newUserId },
      xp: 0,
      totalXPEarned: 0,
      referredBy: null,
      save: jest.fn().mockResolvedValue(true),
    };

    XPTransaction.create = jest.fn().mockResolvedValue(true);
    User.findByIdAndUpdate = jest.fn().mockResolvedValue(true);
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
  });

  it('awards rewards to both referrer and referee, creates XP logs, and updates pointBalance', async () => {
    await applyReferralRewards(mockReferrerProfile, mockNewUserProfile, newUserId);

    // Referee checks
    expect(mockNewUserProfile.referredBy).toEqual(mockReferrerProfile.userId);
    expect(mockNewUserProfile.xp).toBe(REFEREE_XP); // 20
    expect(mockNewUserProfile.totalXPEarned).toBe(REFEREE_XP);
    expect(mockNewUserProfile.save).toHaveBeenCalledTimes(1);

    // Referrer checks
    expect(mockReferrerProfile.referralCount).toBe(3); // 2 + 1
    expect(mockReferrerProfile.xp).toBe(150 + REFERRER_XP); // 150 + 50 = 200
    expect(mockReferrerProfile.totalXPEarned).toBe(150 + REFERRER_XP);
    expect(mockReferrerProfile.save).toHaveBeenCalledTimes(1);

    // Referrer point balance update
    expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
      mockReferrerProfile.userId,
      { $inc: { pointBalance: REFERRER_POINTS } } // 100
    );

    // XPTransaction records created
    expect(XPTransaction.create).toHaveBeenCalledTimes(2);

    // Referee XP transaction
    expect(XPTransaction.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: mockNewUserProfile.userId,
        amount: REFEREE_XP,
        source: 'referral',
        balanceBefore: 0,
        balanceAfter: REFEREE_XP,
      })
    );

    // Referrer XP transaction
    expect(XPTransaction.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: mockReferrerProfile.userId,
        amount: REFERRER_XP,
        source: 'referral',
        balanceBefore: 150,
        balanceAfter: 200,
      })
    );
  });
});

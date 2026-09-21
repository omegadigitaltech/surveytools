'use strict';

const { createGamificationService } = require('../../src/gamification/gamification.service');

describe('Gamification Service — getLevels', () => {
  it('returns levels sorted by level number', async () => {
    const mockLevels = [
      { level: 1, name: 'Novice', minXP: 0 },
      { level: 2, name: 'Explorer', minXP: 100 },
    ];
    const LevelConfig = { find: jest.fn().mockReturnValue({ sort: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(mockLevels) }) }) };

    const service = createGamificationService({ LevelConfig, Achievement: {}, UserGamification: {}, SpinHistory: {}, User: {} });
    const result = await service.getLevels();

    expect(LevelConfig.find).toHaveBeenCalled();
    expect(result).toHaveLength(2);
    expect(result[0].level).toBe(1);
  });
});

describe('Gamification Service — getAchievements', () => {
  const mongoUserId = 'user123';

  it('returns all achievements with correct unlocked flag', async () => {
    const achievementId = 'ach1';
    const allAchievements = [{ _id: { toString: () => achievementId }, title: 'First Spin', category: 'spin', triggerValue: 1, xpReward: 50, pointsReward: 0, icon: '', isActive: true }];
    const profile = { achievements: [{ achievementId: { toString: () => achievementId }, unlockedAt: new Date() }] };

    const Achievement = { find: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(allAchievements) }) };
    const UserGamification = { findOne: jest.fn().mockReturnValue({ select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(profile) }) }) };

    const service = createGamificationService({ LevelConfig: {}, Achievement, UserGamification, SpinHistory: {}, User: {} });
    const result = await service.getAchievements(mongoUserId);

    expect(result).toHaveLength(1);
    expect(result[0].unlocked).toBe(true);
    expect(result[0].unlockedAt).not.toBeNull();
  });

  it('marks achievement as not unlocked if user has no matching record', async () => {
    const allAchievements = [{ _id: { toString: () => 'ach1' }, title: 'First Spin', category: 'spin', triggerValue: 1, xpReward: 50, pointsReward: 0, icon: '', isActive: true }];
    const profile = { achievements: [] };

    const Achievement = { find: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(allAchievements) }) };
    const UserGamification = { findOne: jest.fn().mockReturnValue({ select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(profile) }) }) };

    const service = createGamificationService({ LevelConfig: {}, Achievement, UserGamification, SpinHistory: {}, User: {} });
    const result = await service.getAchievements(mongoUserId);

    expect(result[0].unlocked).toBe(false);
    expect(result[0].unlockedAt).toBeNull();
  });
});

describe('Gamification Service — getSpinHistory', () => {
  const mongoUserId = 'user123';

  it('returns paginated spin history with correct metadata', async () => {
    const fakeSpin = { result: '50_points', pointsAwarded: 50, xpAwarded: 0, spinDate: new Date() };
    const SpinHistory = {
      find: jest.fn().mockReturnValue({ sort: jest.fn().mockReturnValue({ skip: jest.fn().mockReturnValue({ limit: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue([fakeSpin]) }) }) }) }),
      countDocuments: jest.fn().mockResolvedValue(1),
    };

    const service = createGamificationService({ LevelConfig: {}, Achievement: {}, UserGamification: {}, SpinHistory, User: {} });
    const result = await service.getSpinHistory(mongoUserId, 1, 20);

    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.totalPages).toBe(1);
  });

  it('calculates totalPages correctly for multi-page results', async () => {
    const SpinHistory = {
      find: jest.fn().mockReturnValue({ sort: jest.fn().mockReturnValue({ skip: jest.fn().mockReturnValue({ limit: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue([]) }) }) }) }),
      countDocuments: jest.fn().mockResolvedValue(45),
    };

    const service = createGamificationService({ LevelConfig: {}, Achievement: {}, UserGamification: {}, SpinHistory, User: {} });
    const result = await service.getSpinHistory(mongoUserId, 2, 20);

    expect(result.total).toBe(45);
    expect(result.totalPages).toBe(3);
  });
});

describe('Gamification Service — getReferrals', () => {
  const mongoUserId = 'user123';

  it('returns existing referral code and count', async () => {
    const fakeProfile = {
      referralCode: 'ABC123DEFG',
      referralCount: 3,
      referredBy: null,
      save: jest.fn(),
    };
    const UserGamification = {
      findOne: jest.fn().mockReturnValue({ select: jest.fn().mockReturnValue({ populate: jest.fn().mockResolvedValue(fakeProfile) }) }),
    };

    const service = createGamificationService({ LevelConfig: {}, Achievement: {}, UserGamification, SpinHistory: {}, User: {} });
    const result = await service.getReferrals(mongoUserId);

    expect(result.referralCode).toBe('ABC123DEFG');
    expect(result.referralCount).toBe(3);
    expect(result.referredBy).toBeNull();
    expect(fakeProfile.save).not.toHaveBeenCalled();
  });

  it('generates a new referral code if none exists', async () => {
    const fakeProfile = {
      referralCode: null,
      referralCount: 0,
      referredBy: null,
      save: jest.fn().mockResolvedValue(true),
    };
    const UserGamification = {
      findOne: jest.fn().mockReturnValue({ select: jest.fn().mockReturnValue({ populate: jest.fn().mockResolvedValue(fakeProfile) }) }),
    };

    const service = createGamificationService({ LevelConfig: {}, Achievement: {}, UserGamification, SpinHistory: {}, User: {} });
    const result = await service.getReferrals(mongoUserId);

    expect(fakeProfile.save).toHaveBeenCalledTimes(1);
    expect(result.referralCode).toBeTruthy();
    expect(result.referralCode).toHaveLength(10);
  });

  it('throws AppError(404) if profile does not exist', async () => {
    const UserGamification = {
      findOne: jest.fn().mockReturnValue({ select: jest.fn().mockReturnValue({ populate: jest.fn().mockResolvedValue(null) }) }),
    };

    const service = createGamificationService({ LevelConfig: {}, Achievement: {}, UserGamification, SpinHistory: {}, User: {} });

    await expect(service.getReferrals(mongoUserId)).rejects.toMatchObject({
      status: 404,
      message: 'Gamification profile not found',
    });
  });
});

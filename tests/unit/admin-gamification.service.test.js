'use strict';

const { createAdminGamificationService } = require('../../src/admin-gamification/admin-gamification.service');
const { AppError } = require('../../lib/app-error');

describe('Admin Gamification Service', () => {
  describe('createAchievement', () => {
    it('creates a new achievement successfully', async () => {
      const payload = { title: 'Test Achievement', description: 'Test', category: 'spin', triggerValue: 10 };
      const saveMock = jest.fn().mockResolvedValue(true);
      const AchievementMock = function (data) {
        Object.assign(this, data);
        this.save = saveMock;
      };
      AchievementMock.findOne = jest.fn().mockResolvedValue(null);

      const service = createAdminGamificationService({
        Achievement: AchievementMock,
        LevelConfig: {},
        VIPTierConfig: {},
        BonusEvent: {},
      });

      const result = await service.createAchievement(payload);

      expect(AchievementMock.findOne).toHaveBeenCalledWith({ title: 'Test Achievement' });
      expect(saveMock).toHaveBeenCalled();
      expect(result.title).toBe('Test Achievement');
    });

    it('throws AppError(409) if achievement title already exists', async () => {
      const payload = { title: 'Test Achievement', description: 'Test', category: 'spin', triggerValue: 10 };
      const AchievementMock = {
        findOne: jest.fn().mockResolvedValue({ _id: '123' }),
      };

      const service = createAdminGamificationService({
        Achievement: AchievementMock,
        LevelConfig: {},
        VIPTierConfig: {},
        BonusEvent: {},
      });

      await expect(service.createAchievement(payload)).rejects.toMatchObject({
        status: 409,
        message: 'Achievement "Test Achievement" already exists',
      });
    });
  });

  describe('getLevels', () => {
    it('returns levels sorted by level number', async () => {
      const mockLevels = [{ level: 1 }, { level: 2 }];
      const LevelConfigMock = {
        find: jest.fn().mockReturnValue({ sort: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(mockLevels) }) }),
      };

      const service = createAdminGamificationService({
        Achievement: {},
        LevelConfig: LevelConfigMock,
        VIPTierConfig: {},
        BonusEvent: {},
      });

      const result = await service.getLevels();

      expect(LevelConfigMock.find).toHaveBeenCalled();
      expect(result).toHaveLength(2);
    });
  });

  describe('getVipTiers', () => {
    it('returns VIP tiers sorted by minPoints', async () => {
      const mockTiers = [{ minPoints: 0 }, { minPoints: 1000 }];
      const VIPTierConfigMock = {
        find: jest.fn().mockReturnValue({ sort: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(mockTiers) }) }),
      };

      const service = createAdminGamificationService({
        Achievement: {},
        LevelConfig: {},
        VIPTierConfig: VIPTierConfigMock,
        BonusEvent: {},
      });

      const result = await service.getVipTiers();

      expect(VIPTierConfigMock.find).toHaveBeenCalled();
      expect(result).toHaveLength(2);
    });
  });

  describe('BonusEvents', () => {
    it('creates a new bonus event successfully', async () => {
      const payload = { title: 'Weekend 2x', description: '2x Points', startAt: new Date(), endAt: new Date(Date.now() + 86400000) };
      const saveMock = jest.fn().mockResolvedValue(true);
      const BonusEventMock = function (data) {
        Object.assign(this, data);
        this.save = saveMock;
      };

      const service = createAdminGamificationService({
        Achievement: {},
        LevelConfig: {},
        VIPTierConfig: {},
        BonusEvent: BonusEventMock,
      });

      const result = await service.createBonusEvent(payload);

      expect(saveMock).toHaveBeenCalled();
      expect(result.title).toBe('Weekend 2x');
    });

    it('returns bonus events sorted by startAt descending', async () => {
      const mockEvents = [{ title: 'Event 2' }, { title: 'Event 1' }];
      const BonusEventMock = {
        find: jest.fn().mockReturnValue({ sort: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(mockEvents) }) }),
      };

      const service = createAdminGamificationService({
        Achievement: {},
        LevelConfig: {},
        VIPTierConfig: {},
        BonusEvent: BonusEventMock,
      });

      const result = await service.getBonusEvents();

      expect(BonusEventMock.find).toHaveBeenCalled();
      expect(result).toHaveLength(2);
    });
  });
});

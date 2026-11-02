'use strict';

const { resolveBoostMultiplier } = require('../../src/gamification/boost-resolver');

const NOW = new Date('2026-11-02T12:00:00.000Z');

function makeUser(id = 'user-abc') {
  return { _id: id };
}

function makeUserGamificationModel(profileOverride = null) {
  return {
    findOne: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(profileOverride) }),
  };
}

function makeBonusEventModel(eventsOverride = []) {
  return {
    find: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(eventsOverride) }),
  };
}

describe('resolveBoostMultiplier', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns 1 when user has no gamification profile and no bonus events', async () => {
    const UserGamification = makeUserGamificationModel(null);
    const BonusEvent = makeBonusEventModel([]);
    const result = await resolveBoostMultiplier({ UserGamification, BonusEvent, user: makeUser() });
    expect(result).toBe(1);
  });

  it('returns 1 when profile has no activeBoosts array', async () => {
    const UserGamification = makeUserGamificationModel({ userId: 'user-abc' });
    const BonusEvent = makeBonusEventModel([]);
    const result = await resolveBoostMultiplier({ UserGamification, BonusEvent, user: makeUser() });
    expect(result).toBe(1);
  });

  it('returns 1 when activeBoosts array is empty', async () => {
    const UserGamification = makeUserGamificationModel({ userId: 'user-abc', activeBoosts: [] });
    const BonusEvent = makeBonusEventModel([]);
    const result = await resolveBoostMultiplier({ UserGamification, BonusEvent, user: makeUser() });
    expect(result).toBe(1);
  });

  it('returns 2 when user has an active 2x_points boost that has not expired', async () => {
    const profile = {
      userId: 'user-abc',
      activeBoosts: [
        {
          type: '2x_points',
          multiplier: 2,
          expiresAt: new Date(NOW.getTime() + 3600 * 1000), // 1 hour from now
        },
      ],
    };
    const UserGamification = makeUserGamificationModel(profile);
    const BonusEvent = makeBonusEventModel([]);
    const result = await resolveBoostMultiplier({ UserGamification, BonusEvent, user: makeUser() });
    expect(result).toBe(2);
  });

  it('returns 1 when user 2x_points boost has already expired', async () => {
    const profile = {
      userId: 'user-abc',
      activeBoosts: [
        {
          type: '2x_points',
          multiplier: 2,
          expiresAt: new Date(NOW.getTime() - 1000), // expired 1 second ago
        },
      ],
    };
    const UserGamification = makeUserGamificationModel(profile);
    const BonusEvent = makeBonusEventModel([]);
    const result = await resolveBoostMultiplier({ UserGamification, BonusEvent, user: makeUser() });
    expect(result).toBe(1);
  });

  it('returns platform bonus event multiplier when no user boost is active', async () => {
    const UserGamification = makeUserGamificationModel({ userId: 'user-abc', activeBoosts: [] });
    const BonusEvent = makeBonusEventModel([
      {
        _id: 'event-1',
        multiplier: 2,
        isActive: true,
        startAt: new Date(NOW.getTime() - 3600 * 1000),
        endAt: new Date(NOW.getTime() + 3600 * 1000),
      },
    ]);
    const result = await resolveBoostMultiplier({ UserGamification, BonusEvent, user: makeUser() });
    expect(result).toBe(2);
  });

  it('returns the higher of user boost vs platform event multiplier', async () => {
    const profile = {
      userId: 'user-abc',
      activeBoosts: [
        {
          type: '2x_points',
          multiplier: 2,
          expiresAt: new Date(NOW.getTime() + 3600 * 1000),
        },
      ],
    };
    const UserGamification = makeUserGamificationModel(profile);
    const BonusEvent = makeBonusEventModel([
      {
        _id: 'event-3x',
        multiplier: 3,
        isActive: true,
        startAt: new Date(NOW.getTime() - 1000),
        endAt: new Date(NOW.getTime() + 3600 * 1000),
      },
    ]);
    const result = await resolveBoostMultiplier({ UserGamification, BonusEvent, user: makeUser() });
    expect(result).toBe(3);
  });

  it('returns 1 and does not throw when DB lookup fails', async () => {
    const UserGamification = {
      findOne: jest.fn().mockReturnValue({ lean: jest.fn().mockRejectedValue(new Error('DB timeout')) }),
    };
    const BonusEvent = makeBonusEventModel([]);
    const result = await resolveBoostMultiplier({ UserGamification, BonusEvent, user: makeUser() });
    expect(result).toBe(1);
  });
});

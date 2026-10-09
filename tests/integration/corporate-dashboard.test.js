'use strict';

const { createResearcherTierMiddleware } = require('../../src/kyc/attach-researcher-tier.middleware');

describe('Corporate Dashboard Tier Gating', () => {
  it('Allows institutional tier researchers and rejects others', async () => {
    const tierServiceMock = {
      resolveTier: jest.fn().mockImplementation(async (userId) => {
        if (userId === 'premium-user') return 'Premium';
        if (userId === 'inst-user') return 'Institutional';
        return 'Standard';
      })
    };

    const middleware = createResearcherTierMiddleware({ tierService: tierServiceMock });
    
    const nextMock = jest.fn();
    const resMock = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    // 1. Attach Tier
    const req = { userId: 'inst-user' };
    await middleware.attachResearcherTier(req, resMock, nextMock);
    expect(req.researcherTier).toBe('Institutional');
    expect(nextMock).toHaveBeenCalled();

    // 2. Reject non-institutional
    const premiumReq = { userId: 'premium-user', researcherTier: 'Premium' };
    const premiumNext = jest.fn();
    await middleware.requireResearcherTier(['Institutional'])(premiumReq, resMock, premiumNext);
    expect(resMock.status).toHaveBeenCalledWith(403);
    expect(resMock.json).toHaveBeenCalledWith(expect.objectContaining({
      status: 'failure',
      code: 403,
      msg: expect.stringMatching(/Requires one of the following tiers/i)
    }));
    expect(premiumNext).not.toHaveBeenCalled();

    // 3. Allow institutional
    const instReq = { userId: 'inst-user', researcherTier: 'Institutional' };
    const instNext = jest.fn();
    await middleware.requireResearcherTier(['Institutional'])(instReq, resMock, instNext);
    expect(instNext).toHaveBeenCalled();
  });
});

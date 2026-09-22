const { attachResearcherTier, requireResearcherTier } = require('../../src/kyc/attach-researcher-tier.middleware');
const tierService = require('../../src/kyc/researcher-tier.service');

jest.mock('../../src/kyc/researcher-tier.service');

describe('Tier Middleware', () => {
  it('should attach tier to req', async () => {
    tierService.resolveTier.mockResolvedValue('Institutional');
    const req = { userId: 'u1' };
    const next = jest.fn();
    await attachResearcherTier(req, {}, next);
    expect(req.researcherTier).toBe('Institutional');
    expect(next).toHaveBeenCalled();
  });

  it('should reject if not institutional', () => {
    const middleware = requireResearcherTier(['Institutional']);
    const req = { researcherTier: 'Standard' };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('should pass if institutional', () => {
    const middleware = requireResearcherTier(['Institutional']);
    const req = { researcherTier: 'Institutional' };
    const res = {};
    const next = jest.fn();
    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});

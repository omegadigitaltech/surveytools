const { createResearcherTierMiddleware } = require('../../src/kyc/attach-researcher-tier.middleware');

describe('Tier Middleware', () => {
  let middleware;
  let mockTierService;

  beforeEach(() => {
    mockTierService = {
      resolveTier: jest.fn()
    };
    middleware = createResearcherTierMiddleware({ tierService: mockTierService });
  });

  it('should attach tier to req', async () => {
    mockTierService.resolveTier.mockResolvedValue('Institutional');
    const req = { userId: 'u1' };
    const next = jest.fn();
    await middleware.attachResearcherTier(req, {}, next);
    expect(req.researcherTier).toBe('Institutional');
    expect(next).toHaveBeenCalled();
  });

  it('should reject if not institutional', () => {
    const handler = middleware.requireResearcherTier(['Institutional']);
    const req = { researcherTier: 'Standard' };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    handler(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('should pass if institutional', () => {
    const handler = middleware.requireResearcherTier(['Institutional']);
    const req = { researcherTier: 'Institutional' };
    const res = {};
    const next = jest.fn();
    handler(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});

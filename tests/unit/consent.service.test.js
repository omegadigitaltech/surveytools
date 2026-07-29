'use strict';
const { createConsentService } = require('../../src/kyc/consent.service');

describe('Consent Service', () => {
  let repoMock, service;

  beforeEach(() => {
    repoMock = {
      upsertConsent: jest.fn().mockResolvedValue({ success: true }),
    };
    service = createConsentService({ consentRepo: repoMock });
  });

  it('Initial consent creates ConsentRecord per scope', async () => {
    await service.captureInitialConsent('u1', ['health_data', 'marketing']);
    expect(repoMock.upsertConsent).toHaveBeenCalledTimes(2);
    expect(repoMock.upsertConsent).toHaveBeenCalledWith('u1', 'health_data', expect.objectContaining({ granted: true, grantedAt: expect.any(Date) }));
    expect(repoMock.upsertConsent).toHaveBeenCalledWith('u1', 'marketing', expect.objectContaining({ granted: true, grantedAt: expect.any(Date) }));
  });

  it('Revocation sets revokedAt and granted: false', async () => {
    await service.updateConsentScope('u1', 'health_data', false);
    expect(repoMock.upsertConsent).toHaveBeenCalledWith('u1', 'health_data', expect.objectContaining({
      granted: false,
      revokedAt: expect.any(Date)
    }));
  });
});

'use strict';

const { createRespondentLayer2Service } = require('../../src/kyc/respondent-layer2.service');

describe('Respondent Layer 2 Service', () => {
  let repoMock;
  let service;

  beforeEach(() => {
    repoMock = {
      findByUserId: jest.fn(),
      updateLayer2: jest.fn(),
    };
    service = createRespondentLayer2Service({ respondentProfileRepo: repoMock });
  });

  it('Blocks Layer 2 if Layer 1 incomplete', async () => {
    repoMock.findByUserId.mockResolvedValue(null);
    await expect(service.submitLayer2('u1', {})).rejects.toMatchObject({
      status: 403,
      message: 'Layer 1 profile required before Layer 2',
    });
  });

  it('Blocks Layer 2 if not yet eligible', async () => {
    repoMock.findByUserId.mockResolvedValue({ layer2EligibleAt: null });
    await expect(service.submitLayer2('u1', {})).rejects.toMatchObject({
      status: 403,
      message: 'Not yet eligible for Layer 2 profiling',
    });
  });

  it('Valid Layer 2 payload persisted', async () => {
    repoMock.findByUserId.mockResolvedValue({ layer2EligibleAt: new Date(), layer2Completed: false });
    repoMock.updateLayer2.mockResolvedValue({ layer2Completed: true });
    const result = await service.submitLayer2('u1', { educationLevel: 'primary' });
    expect(repoMock.updateLayer2).toHaveBeenCalledWith('u1', { educationLevel: 'primary' });
    expect(result.layer2Completed).toBe(true);
  });
});

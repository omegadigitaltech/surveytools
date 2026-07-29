'use strict';

const { createRespondentSensitiveLayersService } = require('../../src/kyc/respondent-sensitive-layers.service');

jest.mock('../../lib/field-encryptor', () => ({
  encrypt: jest.fn().mockReturnValue({ iv: 'iv', authTag: 'tag', ciphertext: 'cipher' })
}));

describe('Respondent Sensitive Layers Service', () => {
  let repoMock;
  let service;

  beforeEach(() => {
    repoMock = {
      findByUserId: jest.fn(),
      updateLayer3: jest.fn().mockResolvedValue({ success: true }),
    };
    service = createRespondentSensitiveLayersService({ respondentProfileRepo: repoMock });
  });

  it('Returns AppError(403) without Layer 2', async () => {
    repoMock.findByUserId.mockResolvedValue({ layer2Completed: false });
    await expect(service.submitLayer3('u1', {})).rejects.toMatchObject({
      status: 403,
      message: 'Layer 2 must be completed first',
    });
  });

  it('Returns AppError(409) if layer already completed', async () => {
    repoMock.findByUserId.mockResolvedValue({ layer2Completed: true, layer3: {} });
    await expect(service.submitLayer3('u1', {})).rejects.toMatchObject({
      status: 409,
      message: 'Layer 3 already completed',
    });
  });

  it('Encrypts data before passing to repo updateLayer3', async () => {
    repoMock.findByUserId.mockResolvedValue({ layer2Completed: true, layer3: null });
    const payload = { healthConditions: ['None'] };
    await service.submitLayer3('u1', payload);
    
    expect(repoMock.updateLayer3).toHaveBeenCalledWith(
      'u1',
      { iv: 'iv', authTag: 'tag', ciphertext: 'cipher' }
    );
  });
});

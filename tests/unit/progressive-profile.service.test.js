'use strict';

const { createProgressiveProfileService } = require('../../src/kyc/progressive-profile.service');

describe('Progressive Profiling Service', () => {
  let repoMock;
  let service;

  beforeEach(() => {
    repoMock = {
      findByUserId: jest.fn(),
      incrementSurveysCompleted: jest.fn(),
      setLayer2Eligible: jest.fn(),
    };
    service = createProgressiveProfileService({ respondentProfileRepo: repoMock });
  });

  it('Does nothing if no layer 1 profile exists', async () => {
    repoMock.findByUserId.mockResolvedValue(null);
    await service.onSurveyCompleted('u1');
    expect(repoMock.incrementSurveysCompleted).not.toHaveBeenCalled();
  });

  it('Increments surveysCompleted but does not trigger if below threshold', async () => {
    repoMock.findByUserId.mockResolvedValue({ layer2EligibleAt: null });
    repoMock.incrementSurveysCompleted.mockResolvedValue({ surveysCompleted: 2, layer2EligibleAt: null });
    await service.onSurveyCompleted('u1');
    expect(repoMock.incrementSurveysCompleted).toHaveBeenCalledWith('u1');
    expect(repoMock.setLayer2Eligible).not.toHaveBeenCalled();
  });

  it('Sets layer2EligibleAt when threshold reached', async () => {
    repoMock.findByUserId.mockResolvedValue({ layer2EligibleAt: null });
    repoMock.incrementSurveysCompleted.mockResolvedValue({ surveysCompleted: 5, layer2EligibleAt: null });
    await service.onSurveyCompleted('u1');
    expect(repoMock.setLayer2Eligible).toHaveBeenCalledWith('u1', expect.any(Date));
  });

  it('Does not set layer2EligibleAt if already eligible', async () => {
    repoMock.findByUserId.mockResolvedValue({ layer2EligibleAt: new Date() });
    repoMock.incrementSurveysCompleted.mockResolvedValue({ surveysCompleted: 6, layer2EligibleAt: new Date() });
    await service.onSurveyCompleted('u1');
    expect(repoMock.setLayer2Eligible).not.toHaveBeenCalled();
  });
});

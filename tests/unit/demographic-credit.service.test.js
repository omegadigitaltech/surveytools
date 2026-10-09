const { createDemographicCreditService } = require('../../src/corporate-dashboard/demographic-credit.service');

describe('Demographic Credit Service', () => {
  let service;
  let mockSurveyLayerCredit;
  let mockDemographicAggregate;
  let mockLogger;

  beforeEach(() => {
    mockSurveyLayerCredit = {
      create: jest.fn()
    };
    mockDemographicAggregate = {
      bulkWrite: jest.fn()
    };
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn()
    };
    const createLogger = jest.fn().mockReturnValue(mockLogger);

    service = createDemographicCreditService({
      SurveyLayerCredit: mockSurveyLayerCredit,
      DemographicAggregate: mockDemographicAggregate,
      createLogger
    });
  });

  it('should insert credit and increment aggregates', async () => {
    mockSurveyLayerCredit.create.mockResolvedValueOnce(true);
    mockDemographicAggregate.bulkWrite.mockResolvedValueOnce(true);

    await service.creditLayerToSurvey('survey1', 'user1', 'layer3', { gender: 'Male' });

    expect(mockSurveyLayerCredit.create).toHaveBeenCalledWith({
      surveyId: 'survey1',
      userId: 'user1',
      layer: 'layer3'
    });
    
    expect(mockDemographicAggregate.bulkWrite).toHaveBeenCalledWith([{
      updateOne: {
        filter: { surveyId: 'survey1', layer: 'layer3', field: 'gender', value: 'Male' },
        update: { $inc: { count: 1 } },
        upsert: true
      }
    }]);
  });

  it('should safely no-op on duplicate key error (11000)', async () => {
    const duplicateError = new Error('Duplicate');
    duplicateError.code = 11000;
    mockSurveyLayerCredit.create.mockRejectedValueOnce(duplicateError);

    await expect(service.creditLayerToSurvey('survey1', 'user1', 'layer3', { gender: 'Male' })).resolves.toBeUndefined();
    expect(mockDemographicAggregate.bulkWrite).not.toHaveBeenCalled();
    expect(mockLogger.info).toHaveBeenCalledWith(expect.anything(), 'Credit already processed. Skipping.');
  });

  it('should throw on non-11000 error', async () => {
    const otherError = new Error('Database down');
    mockSurveyLayerCredit.create.mockRejectedValueOnce(otherError);

    await expect(service.creditLayerToSurvey('survey1', 'user1', 'layer3', { gender: 'Male' })).rejects.toThrow('Database down');
  });
});

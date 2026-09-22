const mongoose = require('mongoose');
const { creditLayerToSurvey } = require('../../src/corporate-dashboard/demographic-credit.service');
const SurveyLayerCredit = require('../../model/survey-layer-credit');
const DemographicAggregate = require('../../model/demographic-aggregate');

jest.mock('../../model/survey-layer-credit');
jest.mock('../../model/demographic-aggregate');

describe('Demographic Credit Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should insert credit and increment aggregates', async () => {
    SurveyLayerCredit.create.mockResolvedValueOnce({});
    DemographicAggregate.findOneAndUpdate.mockResolvedValue({});

    await creditLayerToSurvey('survey1', 'user1', 'layer3', {
      bloodGroup: 'O+',
      hobbies: ['Reading', 'Gaming']
    });

    expect(SurveyLayerCredit.create).toHaveBeenCalledWith({
      surveyId: 'survey1',
      userId: 'user1',
      layer: 'layer3'
    });

    // Should call findOneAndUpdate for bloodGroup, Reading, Gaming
    expect(DemographicAggregate.findOneAndUpdate).toHaveBeenCalledTimes(3);
    
    expect(DemographicAggregate.findOneAndUpdate).toHaveBeenCalledWith(
      { surveyId: 'survey1', layer: 'layer3', field: 'bloodGroup', value: 'O+' },
      { $inc: { count: 1 } },
      { upsert: true }
    );
    
    expect(DemographicAggregate.findOneAndUpdate).toHaveBeenCalledWith(
      { surveyId: 'survey1', layer: 'layer3', field: 'hobbies', value: 'Reading' },
      { $inc: { count: 1 } },
      { upsert: true }
    );
  });

  it('should safely no-op on duplicate key error (11000)', async () => {
    const duplicateError = new Error('Duplicate key');
    duplicateError.code = 11000;
    SurveyLayerCredit.create.mockRejectedValueOnce(duplicateError);

    await creditLayerToSurvey('survey1', 'user1', 'layer3', {
      bloodGroup: 'O+'
    });

    expect(SurveyLayerCredit.create).toHaveBeenCalled();
    // It should return early without incrementing aggregates
    expect(DemographicAggregate.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it('should throw on non-11000 error', async () => {
    const error = new Error('Some error');
    SurveyLayerCredit.create.mockRejectedValueOnce(error);

    await expect(creditLayerToSurvey('survey1', 'user1', 'layer3', {}))
      .rejects.toThrow('Some error');
  });
});

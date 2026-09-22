'use strict';

const { createDemographicCreditService } = require('../../src/corporate-dashboard/demographic-credit.service');

function makeSurveyLayerCreditModel() {
  const credits = new Set();
  return {
    create: jest.fn(async ({ surveyId, userId, layer }) => {
      const key = `${surveyId}-${userId}-${layer}`;
      if (credits.has(key)) {
        const err = new Error('Duplicate key');
        err.code = 11000;
        throw err;
      }
      credits.add(key);
      return { surveyId, userId, layer };
    }),
  };
}

function makeDemographicAggregateModel() {
  const operations = [];
  return {
    bulkWrite: jest.fn(async (ops) => {
      operations.push(...ops);
      return { ok: 1 };
    }),
    _getOperations: () => operations,
  };
}

describe('Demographic Credit Service Integration', () => {
  it('Credits survey correctly with layer fields and explodes arrays', async () => {
    const SurveyLayerCredit = makeSurveyLayerCreditModel();
    const DemographicAggregate = makeDemographicAggregateModel();
    const loggerMock = { info: jest.fn(), error: jest.fn(), warn: jest.fn() };
    const createLoggerMock = () => loggerMock;

    const service = createDemographicCreditService({
      SurveyLayerCredit,
      DemographicAggregate,
      createLogger: createLoggerMock
    });

    const payload = {
      gender: 'male',
      chronicConditions: ['Asthma', 'Diabetes']
    };

    await service.creditLayerToSurvey('survey-1', 'user-1', 'layer3', payload);

    expect(SurveyLayerCredit.create).toHaveBeenCalledWith({ surveyId: 'survey-1', userId: 'user-1', layer: 'layer3' });
    
    const ops = DemographicAggregate._getOperations();
    expect(ops).toHaveLength(3); // 1 for gender, 2 for chronicConditions

    expect(ops).toContainEqual(expect.objectContaining({
      updateOne: { filter: { surveyId: 'survey-1', layer: 'layer3', field: 'gender', value: 'male' }, update: { $inc: { count: 1 } }, upsert: true }
    }));
    expect(ops).toContainEqual(expect.objectContaining({
      updateOne: { filter: { surveyId: 'survey-1', layer: 'layer3', field: 'chronicConditions', value: 'Asthma' }, update: { $inc: { count: 1 } }, upsert: true }
    }));
    expect(ops).toContainEqual(expect.objectContaining({
      updateOne: { filter: { surveyId: 'survey-1', layer: 'layer3', field: 'chronicConditions', value: 'Diabetes' }, update: { $inc: { count: 1 } }, upsert: true }
    }));
  });

  it('Gracefully handles duplicate keys', async () => {
    const SurveyLayerCredit = makeSurveyLayerCreditModel();
    const DemographicAggregate = makeDemographicAggregateModel();
    const loggerMock = { info: jest.fn(), error: jest.fn(), warn: jest.fn() };
    const createLoggerMock = () => loggerMock;

    const service = createDemographicCreditService({
      SurveyLayerCredit,
      DemographicAggregate,
      createLogger: createLoggerMock
    });

    await service.creditLayerToSurvey('survey-1', 'user-1', 'layer3', { gender: 'male' });
    // Attempt duplicate credit
    await service.creditLayerToSurvey('survey-1', 'user-1', 'layer3', { gender: 'male' });

    expect(loggerMock.info).toHaveBeenCalledWith(expect.objectContaining({ surveyId: 'survey-1' }), 'Credit already processed. Skipping.');
    // Operations should only have 1 (the first successful one)
    expect(DemographicAggregate._getOperations()).toHaveLength(1);
  });
});

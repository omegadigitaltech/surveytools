const { getAnalytics, getOverview } = require('../../src/corporate-dashboard/corporate-dashboard.service');
const repo = require('../../src/corporate-dashboard/corporate-dashboard.repo');
const { AppError } = require('../../lib/app-error');

jest.mock('../../src/corporate-dashboard/corporate-dashboard.repo');

describe('Corporate Dashboard Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should validate allowed filters', async () => {
    repo.getSurveysForExport.mockResolvedValueOnce({ _id: 'survey1' });
    repo.getAggregatedDemographics.mockResolvedValueOnce({});
    
    await expect(getAnalytics('user1', { surveyId: 'survey1', filters: ['gender'] })).resolves.toBeDefined();
    expect(repo.getAggregatedDemographics).toHaveBeenCalledWith('survey1', ['gender']);
  });

  it('should reject invalid filters', async () => {
    await expect(getAnalytics('user1', { surveyId: 'survey1', filters: ['invalid_filter'] }))
      .rejects.toThrow(AppError);
  });
});

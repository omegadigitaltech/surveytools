const { createCorporateDashboardService } = require('../../src/corporate-dashboard/corporate-dashboard.service');
const { AppError } = require('../../lib/app-error');
const schemas = require('../../src/corporate-dashboard/corporate-dashboard.schema');

describe('Corporate Dashboard Service', () => {
  let service;
  let mockRepo;
  let mockLogger;

  beforeEach(() => {
    mockRepo = {
      getOrgWideStats: jest.fn(),
      getSurveysForExport: jest.fn(),
      getAggregatedDemographics: jest.fn(),
      getOrgBillingDetails: jest.fn()
    };
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn()
    };
    const createLogger = jest.fn().mockReturnValue(mockLogger);

    service = createCorporateDashboardService({ 
      repo: mockRepo, 
      AppError, 
      schemas, 
      PDFDocument: jest.fn(), 
      Invoice: {}, 
      createLogger 
    });
  });

  it('should validate allowed filters', async () => {
    mockRepo.getSurveysForExport.mockResolvedValueOnce({ _id: 'survey1' });
    mockRepo.getAggregatedDemographics.mockResolvedValueOnce({});
    
    await expect(service.getAnalytics('user1', { surveyId: 'survey1', filters: ['gender'] })).resolves.toBeDefined();
    expect(mockRepo.getAggregatedDemographics).toHaveBeenCalledWith('survey1', ['gender']);
  });

  it('should reject invalid filters', async () => {
    await expect(service.getAnalytics('user1', { surveyId: 'survey1', filters: ['invalid_filter'] }))
      .rejects.toThrow(AppError);
  });
});

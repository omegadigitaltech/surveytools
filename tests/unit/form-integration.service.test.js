'use strict';

const { createFormIntegrationService } = require('../../src/form-integration/form-integration.service');
const { AppError } = require('../../lib/app-error');

jest.mock('../../src/form-integration/connectors', () => ({
  detectPlatform: jest.fn(),
  getConnector:   jest.fn(),
}));

jest.mock('../../config/form-integration-config', () => ({
  typeformApiKey:       'tf-key',
  tallyApiKey:          'tally-key',
  typeformWebhookSecret: 'tf-secret',
  tallyWebhookSecret:   'tally-secret',
  webhookBaseUrl:       '',
}));

jest.mock('csv-parse/sync', () => ({
  parse: jest.fn(),
}));

const { detectPlatform, getConnector } = require('../../src/form-integration/connectors');
const { parse: csvParse } = require('csv-parse/sync');

const makeRepo = (overrides = {}) => ({
  createExternalForm:    jest.fn(),
  findById:              jest.fn(),
  findByPlatformFormId:  jest.fn(),
  incrementResponseCount: jest.fn(),
  setResponseCount:      jest.fn(),
  listForResearcher:     jest.fn(),
  updateStatus:          jest.fn(),
  ...overrides,
});

const makeOAuthToken = (overrides = {}) => ({
  getGoogleTokens:    jest.fn(),
  upsertGoogleTokens: jest.fn(),
  ...overrides,
});

const makeConnector = (overrides = {}) => ({
  extractFormId:      jest.fn().mockReturnValue('form-abc'),
  fetchMetadata:      jest.fn().mockResolvedValue({ title: 'My Form', description: '' }),
  fetchQuestions:     jest.fn().mockResolvedValue([]),
  fetchResponseCount: jest.fn().mockResolvedValue(5),
  registerWebhook:    jest.fn().mockResolvedValue(undefined),
  parseWebhookPayload: jest.fn(),
  ...overrides,
});

describe('Form Integration Service', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('importForm', () => {
    it('imports a Typeform form and returns the created record', async () => {
      const connector = makeConnector();
      detectPlatform.mockReturnValue('typeform');
      getConnector.mockReturnValue(connector);

      const created = { _id: '1', platform: 'typeform', platformFormId: 'form-abc' };
      const repo = makeRepo({
        findByPlatformFormId: jest.fn().mockResolvedValue(null),
        createExternalForm:   jest.fn().mockResolvedValue(created),
      });

      const service = createFormIntegrationService({ repo, OAuthToken: makeOAuthToken() });
      const result = await service.importForm('https://test.typeform.com/to/form-abc', 'researcher-1');

      expect(repo.createExternalForm).toHaveBeenCalledWith(
        expect.objectContaining({ platform: 'typeform', platformFormId: 'form-abc', researcherId: 'researcher-1' })
      );
      expect(result).toEqual(created);
    });

    it('throws 409 when the same researcher imports the same form twice', async () => {
      const connector = makeConnector();
      detectPlatform.mockReturnValue('typeform');
      getConnector.mockReturnValue(connector);

      const repo = makeRepo({
        findByPlatformFormId: jest.fn().mockResolvedValue({ researcherId: 'researcher-1' }),
      });

      const service = createFormIntegrationService({ repo, OAuthToken: makeOAuthToken() });

      await expect(
        service.importForm('https://test.typeform.com/to/form-abc', 'researcher-1')
      ).rejects.toThrow(AppError);
    });

    it('allows two different researchers to import the same form', async () => {
      const connector = makeConnector();
      detectPlatform.mockReturnValue('typeform');
      getConnector.mockReturnValue(connector);

      const created = { _id: '2', platform: 'typeform' };
      const repo = makeRepo({
        findByPlatformFormId: jest.fn().mockResolvedValue({ researcherId: 'other-researcher' }),
        createExternalForm:   jest.fn().mockResolvedValue(created),
      });

      const service = createFormIntegrationService({ repo, OAuthToken: makeOAuthToken() });
      const result = await service.importForm('https://test.typeform.com/to/form-abc', 'researcher-2');

      expect(repo.createExternalForm).toHaveBeenCalled();
      expect(result).toEqual(created);
    });

    it('imports a Tally form successfully when API key is present', async () => {
      const connector = makeConnector();
      detectPlatform.mockReturnValue('tally');
      getConnector.mockReturnValue(connector);

      const created = { _id: '4', platform: 'tally', platformFormId: 'form-abc' };
      const repo = makeRepo({
        findByPlatformFormId: jest.fn().mockResolvedValue(null),
        createExternalForm:   jest.fn().mockResolvedValue(created),
      });

      const service = createFormIntegrationService({ repo, OAuthToken: makeOAuthToken() });
      const result = await service.importForm('https://tally.so/r/form-abc', 'researcher-1');

      expect(repo.createExternalForm).toHaveBeenCalledWith(
        expect.objectContaining({ platform: 'tally', platformFormId: 'form-abc' })
      );
      expect(result).toEqual(created);
    });

    it('throws 403 when Google Forms is requested but no OAuth credentials exist', async () => {
      const connector = makeConnector();
      detectPlatform.mockReturnValue('google_forms');
      getConnector.mockReturnValue(connector);

      const OAuthToken = makeOAuthToken({
        getGoogleTokens: jest.fn().mockResolvedValue(null),
      });

      const repo = makeRepo({
        findByPlatformFormId: jest.fn().mockResolvedValue(null),
      });

      const service = createFormIntegrationService({ repo, OAuthToken });

      await expect(
        service.importForm('https://docs.google.com/forms/d/form-abc/edit', 'researcher-1')
      ).rejects.toThrow(AppError);
    });
  });

  describe('handleWebhook', () => {
    it('increments response count on a valid Typeform webhook', async () => {
      const updated = { platformFormId: 'form-abc', postImportResponseCount: 6 };
      const repo = makeRepo({
        incrementResponseCount: jest.fn().mockResolvedValue(updated),
      });

      const connector = makeConnector({
        parseWebhookPayload: jest.fn().mockReturnValue({ platformFormId: 'form-abc', newResponseCount: null }),
      });
      getConnector.mockReturnValue(connector);

      const service = createFormIntegrationService({ repo, OAuthToken: makeOAuthToken() });
      await service.handleWebhook('typeform', Buffer.from('{}'), 'sha256=sig');

      expect(repo.incrementResponseCount).toHaveBeenCalledWith('form-abc', 'typeform');
    });

    it('logs a warning and returns without error for an unknown form', async () => {
      const repo = makeRepo({
        incrementResponseCount: jest.fn().mockResolvedValue(null),
      });

      const connector = makeConnector({
        parseWebhookPayload: jest.fn().mockReturnValue({ platformFormId: 'unknown-form', newResponseCount: null }),
      });
      getConnector.mockReturnValue(connector);

      const service = createFormIntegrationService({ repo, OAuthToken: makeOAuthToken() });
      await expect(service.handleWebhook('typeform', Buffer.from('{}'), 'sha256=sig')).resolves.not.toThrow();
    });
  });

  describe('uploadCsvSnapshot', () => {
    it('parses a valid CSV and creates an external form record', async () => {
      csvParse.mockReturnValue([
        { Name: 'Alice', Age: '30' },
        { Name: 'Bob',   Age: '25' },
      ]);

      const created = { _id: '3', platform: 'csv_import' };
      const repo = makeRepo({
        createExternalForm: jest.fn().mockResolvedValue(created),
      });

      const service = createFormIntegrationService({ repo, OAuthToken: makeOAuthToken() });
      const result = await service.uploadCsvSnapshot(Buffer.from('Name,Age\nAlice,30'), 'export.csv', 'researcher-1');

      expect(repo.createExternalForm).toHaveBeenCalledWith(
        expect.objectContaining({
          platform: 'csv_import',
          snapshotResponseCount: 2,
          title: 'export.csv',
        })
      );
      expect(result).toEqual(created);
    });

    it('throws 400 when the CSV is empty', async () => {
      csvParse.mockReturnValue([]);

      const service = createFormIntegrationService({ repo: makeRepo(), OAuthToken: makeOAuthToken() });

      await expect(
        service.uploadCsvSnapshot(Buffer.from(''), 'empty.csv', 'researcher-1')
      ).rejects.toThrow(AppError);
    });

    it('throws 400 when csv-parse throws a parse error', async () => {
      csvParse.mockImplementation(() => { throw new Error('Invalid CSV'); });

      const service = createFormIntegrationService({ repo: makeRepo(), OAuthToken: makeOAuthToken() });

      await expect(
        service.uploadCsvSnapshot(Buffer.from('bad data'), 'bad.csv', 'researcher-1')
      ).rejects.toThrow(AppError);
    });
  });

  describe('listForms', () => {
    it('returns paginated results from repo', async () => {
      const repo = makeRepo({
        listForResearcher: jest.fn().mockResolvedValue({ data: [{ _id: '1' }], total: 1 }),
      });

      const service = createFormIntegrationService({ repo, OAuthToken: makeOAuthToken() });
      const result = await service.listForms('researcher-1', { page: 1, limit: 20 });

      expect(result).toEqual({ data: [{ _id: '1' }], total: 1, page: 1, totalPages: 1 });
    });
  });

  describe('getForm', () => {
    it('returns the form when found', async () => {
      const form = { _id: 'form-1', researcherId: 'researcher-1' };
      const repo = makeRepo({ findById: jest.fn().mockResolvedValue(form) });

      const service = createFormIntegrationService({ repo, OAuthToken: makeOAuthToken() });
      const result = await service.getForm('form-1', 'researcher-1');

      expect(result).toEqual(form);
    });

    it('throws 404 when the form is not found', async () => {
      const repo = makeRepo({ findById: jest.fn().mockResolvedValue(null) });

      const service = createFormIntegrationService({ repo, OAuthToken: makeOAuthToken() });

      await expect(service.getForm('unknown', 'researcher-1')).rejects.toThrow(AppError);
    });
  });

});

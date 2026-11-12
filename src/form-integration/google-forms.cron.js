'use strict';

const Queue = require('bull');
const { createLogger } = require('../../lib/logger');
const config = require('../../config/form-integration-config');
const { ExternalForm } = require('../../model/external-form');
const { OAuthToken } = require('../../model/oauth-token');
const { createFormIntegrationRepo } = require('./form-integration.repo');
const { createFormIntegrationService } = require('./form-integration.service');

const log = createLogger('google-forms-cron');

const repo = createFormIntegrationRepo({ ExternalForm });
const service = createFormIntegrationService({ repo, OAuthToken });

function initGoogleFormsPoll() {
  const pollQueue = new Queue('google-forms-poll', process.env.REDIS_URL || 'redis://localhost:6379');

  pollQueue.process(async (job) => {
    log.info('Google forms poll job started');

    try {
      const forms = await ExternalForm.find({ platform: 'google_forms', status: 'active' }).lean();
      
      let successCount = 0;
      let failureCount = 0;

      for (const form of forms) {
        try {
          await service.pollGoogleForm(form.platformFormId, form.researcherId);
          successCount++;
        } catch (err) {
          log.error({ platformFormId: form.platformFormId, err: err.message }, 'Failed to poll google form');
          failureCount++;
        }
      }

      log.info({ successCount, failureCount, total: forms.length }, 'Google forms poll job completed');
      return { successCount, failureCount };
    } catch (err) {
      log.error({ err: err.message }, 'Google forms poll job failed fatally');
      throw err;
    }
  });

  pollQueue.add({}, { repeat: { every: config.googlePollIntervalMs } });
  
  log.info(`Google Forms poll cron initialized (interval: ${config.googlePollIntervalMs}ms)`);
}

module.exports = initGoogleFormsPoll;

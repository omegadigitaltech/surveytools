'use strict';

const express = require('express');
const { ExternalForm } = require('../../model/external-form');
const { OAuthToken } = require('../../model/oauth-token');
const { createFormIntegrationRepo } = require('./form-integration.repo');
const { createFormIntegrationService } = require('./form-integration.service');

const router = express.Router();

const repo = createFormIntegrationRepo({ ExternalForm });
const service = createFormIntegrationService({ repo, OAuthToken });


router.use('/webhooks', express.raw({ type: '*/*' }));

router.post('/webhooks/typeform', async (req, res, next) => {
  try {
    const signature = req.headers['typeform-signature'];
    await service.handleWebhook('typeform', req.body, signature);
    res.status(200).send('OK');
  } catch (err) {
    next(err);
  }
});

router.post('/webhooks/tally', async (req, res, next) => {
  try {
    const signature = req.headers['tally-signature'];
    await service.handleWebhook('tally', req.body, signature);
    res.status(200).send('OK');
  } catch (err) {
    next(err);
  }
});

module.exports = router;

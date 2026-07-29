'use strict';

const { AppError } = require('../../lib/app-error');
const { layer3Body } = require('./respondent-layer3.schema');
const { layer4Body } = require('./respondent-layer4.schema');
const { layer5Body } = require('./respondent-layer5.schema');
const logger = require('../../lib/logger');

/**
 * @param {{ service: object }} dependencies
 * @returns {{ submitLayer3: import('express').RequestHandler, submitLayer4: import('express').RequestHandler, submitLayer5: import('express').RequestHandler }}
 */
function createRespondentSensitiveLayersController({ service }) {
  async function submitLayer3(req, res, next) {
    try {
      const result = layer3Body.safeParse(req.body);
      if (!result.success) throw new AppError(400, result.error.errors[0].message);
      logger.info({ action: 'submit_layer3' });
      await service.submitLayer3(req.userId, result.data);
      res.status(200).json({ status: 'success' });
    } catch (err) { next(err); }
  }

  async function submitLayer4(req, res, next) {
    try {
      const result = layer4Body.safeParse(req.body);
      if (!result.success) throw new AppError(400, result.error.errors[0].message);
      logger.info({ action: 'submit_layer4' });
      await service.submitLayer4(req.userId, result.data);
      res.status(200).json({ status: 'success' });
    } catch (err) { next(err); }
  }

  async function submitLayer5(req, res, next) {
    try {
      const result = layer5Body.safeParse(req.body);
      if (!result.success) throw new AppError(400, result.error.errors[0].message);
      logger.info({ action: 'submit_layer5' });
      await service.submitLayer5(req.userId, result.data);
      res.status(200).json({ status: 'success' });
    } catch (err) { next(err); }
  }

  return { submitLayer3, submitLayer4, submitLayer5 };
}
module.exports = { createRespondentSensitiveLayersController };

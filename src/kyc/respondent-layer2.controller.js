'use strict';

const { AppError } = require('../../lib/app-error');
const { layer2Body } = require('./respondent-layer2.schema');

/**
 * @param {{ service: object, progressiveService: object }} dependencies
 * @returns {{ submitLayer2: import('express').RequestHandler, getLayerStatus: import('express').RequestHandler, hookSurveyCompleted: import('express').RequestHandler }}
 */
function createRespondentLayer2Controller({ service, progressiveService }) {
  async function submitLayer2(req, res, next) {
    try {
      const result = layer2Body.safeParse(req.body);
      if (!result.success) {
        throw new AppError(400, result.error.issues[0].message);
      }

      const userId = req.userId;
      const profile = await service.submitLayer2(userId, result.data);

      res.status(200).json({ status: 'success', data: profile });
    } catch (err) {
      next(err);
    }
  }

  async function getLayerStatus(req, res, next) {
    try {
      const status = await service.getLayerStatus(req.userId);
      res.status(200).json({ status: 'success', data: status });
    } catch (err) {
      next(err);
    }
  }

  async function hookSurveyCompleted(req, res, next) {
    try {
      await progressiveService.onSurveyCompleted(req.userId);
      res.status(200).json({ status: 'success', msg: 'Hook executed' });
    } catch (err) {
      next(err);
    }
  }

  return { submitLayer2, getLayerStatus, hookSurveyCompleted };
}

module.exports = { createRespondentLayer2Controller };

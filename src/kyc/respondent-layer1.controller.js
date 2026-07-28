'use strict';

const { AppError } = require('../../lib/app-error');
const { layer1Body } = require('./respondent-layer1.schema');

/**
 * @param {{ service: object }} dependencies
 * @returns {{ submitLayer1: import('express').RequestHandler }}
 */
function createRespondentLayer1Controller({ service }) {
  async function submitLayer1(req, res, next) {
    try {
      const result = layer1Body.safeParse(req.body);
      if (!result.success) {
        throw new AppError(400, result.error.errors[0].message);
      }

      const userId = req.userId;
      const profile = await service.submit(userId, result.data);

      res.status(201).json({ status: 'success', data: profile });
    } catch (err) {
      next(err);
    }
  }

  return { submitLayer1 };
}

module.exports = { createRespondentLayer1Controller };

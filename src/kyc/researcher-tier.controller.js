'use strict';

/**
 * @param {{ service: object }} dependencies
 * @returns {{ getTier: import('express').RequestHandler, resolveTierMiddleware: import('express').RequestHandler }}
 */
function createResearcherTierController({ service }) {
  async function getTier(req, res, next) {
    try {
      const userId = req.userId;
      const tier = await service.resolveTier(userId);
      res.status(200).json({ status: 'success', data: { tier } });
    } catch (err) {
      next(err);
    }
  }

  async function resolveTierMiddleware(req, res, next) {
    try {
      const tier = await service.resolveTier(req.userId);
      req.researcherTier = tier;
      next();
    } catch (err) {
      next(err);
    }
  }

  return { getTier, resolveTierMiddleware };
}

module.exports = { createResearcherTierController };

'use strict';

const { AppError } = require('../../lib/app-error');
const { ResearcherTier } = require('./researcher-tier.service');

const TIER_RANK = {
  [ResearcherTier.STANDARD]:      1,
  [ResearcherTier.PREMIUM]:       2,
  [ResearcherTier.INSTITUTIONAL]: 3,
};

/**
 * Usage: router.get('/premium-feature', requireResearcherTier(['Premium', 'Institutional']), handler)
 * @param {string[]} allowedTiers
 * @returns {import('express').RequestHandler}
 */
function requireResearcherTier(allowedTiers) {
  return (req, res, next) => {
    const tier = req.researcherTier;
    const minRank = Math.min(...allowedTiers.map(t => TIER_RANK[t]));
    if (!tier || TIER_RANK[tier] < minRank) {
      return next(new AppError(403, 'Insufficient researcher tier for this feature'));
    }
    next();
  };
}

module.exports = { requireResearcherTier };

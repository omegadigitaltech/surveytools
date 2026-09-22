'use strict';

/**
 * @param {{ tierService: object }} dependencies
 * @returns {object}
 */
function createResearcherTierMiddleware({ tierService }) {
  async function attachResearcherTier(req, res, next) {
    try {
      req.researcherTier = await tierService.resolveTier(req.userId);
      next();
    } catch (err) {
      next(err);
    }
  }

  function requireResearcherTier(allowedTiers) {
    return (req, res, next) => {
      if (!req.researcherTier || !allowedTiers.includes(req.researcherTier)) {
        return res.status(403).json({
          status: 'failure',
          code: 403,
          msg: `Access denied. Requires one of the following tiers: ${allowedTiers.join(', ')}`
        });
      }
      next();
    };
  }

  return { attachResearcherTier, requireResearcherTier };
}

module.exports = { createResearcherTierMiddleware };

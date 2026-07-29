'use strict';

/**
 * @param {{ progressiveService: object }} dependencies
 * @returns {import('express').RequestHandler}
 */
function createCheckLayerTriggerMiddleware({ progressiveService }) {
  return async (req, res, next) => {
    if (req.userId) {
      progressiveService.onSurveyCompleted(req.userId).catch(() => {
        // Silent catch for background progressive profiling check
      });
    }
    next();
  };
}

module.exports = { createCheckLayerTriggerMiddleware };

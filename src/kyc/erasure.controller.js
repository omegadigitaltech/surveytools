'use strict';
const { createLogger } = require('../../lib/logger');
const logger = createLogger('erasure');

/**
 * @param {{ erasureService: object }} dependencies
 */
function createErasureController({ erasureService }) {
  async function erase(req, res, next) {
    try {
      await erasureService.erase(req.userId);
      logger.info({ action: 'erase_data', userId: req.userId });
      res.status(200).json({ status: 'success' });
    } catch (err) { next(err); }
  }

  return { erase };
}
module.exports = { createErasureController };

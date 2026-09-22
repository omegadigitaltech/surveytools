'use strict';

/**
 * @param {{ service: object, User: object }} dependencies
 * @returns {object}
 */
function createCorporateDashboardController({ service, User }) {
  
  /**
   * Retrieves overview statistics for the corporate dashboard
   * @param {object} req - Express request
   * @param {object} res - Express response
   * @param {function} next - Express next middleware
   */
  async function getOverview(req, res, next) {
    try {
      const user = await User.findOne({ id: req.userId });
      if (!user) return res.status(404).json({ msg: 'User not found' });
      const data = await service.getOverview(user._id);
      res.json({ status: 'success', data });
    } catch (err) { next(err); }
  }

  /**
   * Retrieves analytics data based on filters
   * @param {object} req - Express request
   * @param {object} res - Express response
   * @param {function} next - Express next middleware
   */
  async function getAnalytics(req, res, next) {
    try {
      const user = await User.findOne({ id: req.userId });
      if (!user) return res.status(404).json({ msg: 'User not found' });

      const filtersParam = req.query.filters;
      let filters;
      if (filtersParam) {
        filters = Array.isArray(filtersParam) ? filtersParam : filtersParam.split(',');
      }
      
      const data = await service.getAnalytics(user._id, { surveyId: req.query.surveyId, filters });
      res.json({ status: 'success', data });
    } catch (err) { next(err); }
  }

  /**
   * Retrieves a generated invoice PDF
   * @param {object} req - Express request
   * @param {object} res - Express response
   * @param {function} next - Express next middleware
   */
  async function getInvoice(req, res, next) {
    try {
      const data = await service.generateInvoice(req.userId, req.params.id);
      res.json({ status: 'success', data });
    } catch (err) { next(err); }
  }

  /**
   * Exports survey data for a given format
   * @param {object} req - Express request
   * @param {object} res - Express response
   * @param {function} next - Express next middleware
   */
  async function getExport(req, res, next) {
    try {
      const user = await User.findOne({ id: req.userId });
      if (!user) return res.status(404).json({ msg: 'User not found' });

      const data = await service.exportData(user._id, req.query);
      res.json({ status: 'success', data });
    } catch (err) { next(err); }
  }

  return {
    getOverview,
    getAnalytics,
    getInvoice,
    getExport
  };
}

module.exports = { createCorporateDashboardController };

'use strict';

/**
 * @param {{ service: object, User: object }} dependencies
 * @returns {object}
 */
function createCorporateDashboardController({ service, User, AppError }) {
  
  /**
   * Retrieves overview statistics for the corporate dashboard
   * @param {object} req - Express request
   * @param {object} res - Express response
   * @param {function} next - Express next middleware
   */
  async function getOverview(req, res, next) {
    try {
      const user = await User.findOne({ id: req.userId });
      if (!user) throw new AppError(404, 'User not found');
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
      if (!user) throw new AppError(404, 'User not found');

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
      const data = await service.generateInvoice(req.userId, req.params.surveyId);
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
      if (!user) throw new AppError(404, 'User not found');

      const result = await service.exportData(user._id, req.query);
      if (result.format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="survey_export_${req.query.surveyId}.csv"`);
        return res.send(result.data);
      } else if (result.format === 'pdf') {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="survey_export_${req.query.surveyId}.pdf"`);
        return res.send(Buffer.from(result.data, 'base64'));
      }
      
      res.json({ status: 'success', data: result });
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

const service = require('./corporate-dashboard.service');
const User = require('../../model/user');

async function getOverview(req, res, next) {
  try {
    const user = await User.findOne({ id: req.userId });
    if (!user) return res.status(404).json({ msg: 'User not found' });
    const data = await service.getOverview(user._id);
    res.json({ status: 'success', data });
  } catch (err) { next(err); }
}

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

async function getInvoice(req, res, next) {
  try {
    const data = await service.generateInvoice(req.userId, req.params.id);
    res.json({ status: 'success', data });
  } catch (err) { next(err); }
}

async function getExport(req, res, next) {
  try {
    const user = await User.findOne({ id: req.userId });
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const data = await service.exportData(user._id, req.query);
    res.json({ status: 'success', data });
  } catch (err) { next(err); }
}

module.exports = {
  getOverview,
  getAnalytics,
  getInvoice,
  getExport
};

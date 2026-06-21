const { Mission, LevelConfig, VIPTierConfig } = require('../model/gamification');
const { MarketplaceListing } = require('../model/marketplace');

// ─── ADMIN: MISSIONS ────────────────────────────────────────────────────────
exports.createMission = async (req, res, next) => {
  try {
    const mission = new Mission(req.body);
    await mission.save();
    res.status(201).json({ status: 'success', data: mission });
  } catch (error) { next(error); }
};

exports.getMissionsAdmin = async (req, res, next) => {
  try {
    const missions = await Mission.find();
    res.status(200).json({ status: 'success', data: missions });
  } catch (error) { next(error); }
};

// ─── ADMIN: MARKETPLACE ──────────────────────────────────────────────────────
exports.createMarketplaceListing = async (req, res, next) => {
  try {
    const listing = new MarketplaceListing(req.body);
    await listing.save();
    res.status(201).json({ status: 'success', data: listing });
  } catch (error) { next(error); }
};

exports.getMarketplaceListingsAdmin = async (req, res, next) => {
  try {
    const listings = await MarketplaceListing.find();
    res.status(200).json({ status: 'success', data: listings });
  } catch (error) { next(error); }
};

// ─── ADMIN: LEVELS & VIP ──────────────────────────────────────────────────────
exports.createLevelConfig = async (req, res, next) => {
  try {
    const level = new LevelConfig(req.body);
    await level.save();
    res.status(201).json({ status: 'success', data: level });
  } catch (error) { next(error); }
};

exports.createVIPTierConfig = async (req, res, next) => {
  try {
    const tier = new VIPTierConfig(req.body);
    await tier.save();
    res.status(201).json({ status: 'success', data: tier });
  } catch (error) { next(error); }
};

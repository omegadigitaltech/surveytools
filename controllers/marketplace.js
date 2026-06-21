const { MarketplaceListing, Voucher, PointTransaction } = require('../model/marketplace');
const User = require('../model/user');
const mongoose = require('mongoose');

// Helper to generate a random alphanumeric code
const generateVoucherCode = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// ─── GET MARKETPLACE LISTINGS ────────────────────────────────────────────────
const getMarketplaceListings = async (req, res, next) => {
  try {
    const listings = await MarketplaceListing.find({ isActive: true }).sort({ pointsCost: 1 });
    
    // Group them for the frontend
    const premiumUpgrades = listings.filter(l => l.type === 'premium_upgrade');
    const rewards = listings.filter(l => l.type !== 'premium_upgrade');

    res.status(200).json({
      status: 'success',
      data: {
        premiumUpgrades,
        rewards
      }
    });
  } catch (error) {
    next(error);
  }
};

// ─── PURCHASE / CONVERT POINTS TO VOUCHER ────────────────────────────────────
const convertPointsToVoucher = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { listingId, pointsToConvert } = req.body; // Buy a listing OR convert raw points
    const user = await User.findOne({ id: req.userId }).session(session);

    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ status: 'failure', msg: 'User not found' });
    }

    let pointsCost = 0;
    let voucherType = 'cash_conversion';
    let voucherValue = '';
    let targetListing = null;

    if (listingId) {
      targetListing = await MarketplaceListing.findById(listingId).session(session);
      if (!targetListing || !targetListing.isActive) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ status: 'failure', msg: 'Listing not found or inactive' });
      }
      if (targetListing.stock === 0) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ status: 'failure', msg: 'Item out of stock' });
      }
      pointsCost = targetListing.pointsCost;
      voucherType = targetListing.type;
      voucherValue = targetListing.value;
    } else if (pointsToConvert) {
      // Manual generic conversion, e.g., 100 points = $1
      pointsCost = parseInt(pointsToConvert, 10);
      if (isNaN(pointsCost) || pointsCost <= 0) {
         await session.abortTransaction();
         session.endSession();
         return res.status(400).json({ status: 'failure', msg: 'Invalid points amount to convert' });
      }
      const conversionRate = 100; // Example: 100 points = $1
      const cashValue = (pointsCost / conversionRate).toFixed(2);
      voucherValue = `$${cashValue}`;
    } else {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ status: 'failure', msg: 'Must provide either listingId or pointsToConvert' });
    }

    if (user.pointBalance < pointsCost) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ status: 'failure', msg: 'Insufficient points' });
    }

    // Deduct points
    user.pointBalance -= pointsCost;

    // Create Voucher
    const voucher = new Voucher({
      userId: user._id,
      listingId: targetListing ? targetListing._id : null,
      code: generateVoucherCode(),
      type: voucherType,
      value: voucherValue,
      pointsSpent: pointsCost,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days validity
    });

    // Create Transaction Record
    const transaction = new PointTransaction({
      userId: user._id,
      type: 'converted',
      amount: -pointsCost,
      description: targetListing ? `Purchased ${targetListing.title}` : `Converted points to ${voucherValue} voucher`,
      referenceId: voucher._id,
      balanceAfter: user.pointBalance
    });

    // Update Stock if applicable
    if (targetListing && targetListing.stock > 0) {
      targetListing.stock -= 1;
      await targetListing.save({ session });
    }

    await user.save({ session });
    await voucher.save({ session });
    await transaction.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      status: 'success',
      msg: 'Points converted successfully',
      data: {
        voucher,
        newBalance: user.pointBalance
      }
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

// ─── GET VOUCHER WALLET ───────────────────────────────────────────────────────
const getVoucherWallet = async (req, res, next) => {
  try {
    const user = await User.findOne({ id: req.userId });
    if (!user) return res.status(404).json({ status: 'failure', msg: 'User not found' });

    const vouchers = await Voucher.find({ userId: user._id })
      .populate('listingId', 'title partnerName imageUrl')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: vouchers
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET TRANSACTION SUMMARY ──────────────────────────────────────────────────
const getTransactionSummary = async (req, res, next) => {
  try {
    const user = await User.findOne({ id: req.userId });
    if (!user) return res.status(404).json({ status: 'failure', msg: 'User not found' });

    const transactions = await PointTransaction.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(50); // Get last 50 transactions for the summary

    res.status(200).json({
      status: 'success',
      data: transactions
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMarketplaceListings,
  convertPointsToVoucher,
  getVoucherWallet,
  getTransactionSummary
};

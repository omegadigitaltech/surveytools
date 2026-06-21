const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const {
  getMarketplaceListings,
  convertPointsToVoucher,
  getVoucherWallet,
  getTransactionSummary
} = require('../controllers/marketplace');

// Marketplace & Premium Upgrades
router.get('/marketplace/listings', authMiddleware, getMarketplaceListings);

// Purchase Listing or Convert Points -> Voucher
router.post('/marketplace/convert', authMiddleware, convertPointsToVoucher);

// Voucher Wallet
router.get('/marketplace/wallet', authMiddleware, getVoucherWallet);

// Transaction History (Summary)
router.get('/marketplace/transactions', authMiddleware, getTransactionSummary);

module.exports = router;

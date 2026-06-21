const mongoose = require('mongoose');
const { Schema } = mongoose;

// ─── MARKETPLACE LISTING ──────────────────────────────────────────────────────
const MarketplaceListingSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['discount', 'premium_upgrade', 'gift_card'], required: true },
  pointsCost: { type: Number, required: true },
  value: { type: String }, // e.g., "10% Off", "$5", "Pro Version"
  partnerName: { type: String, default: 'SurveyTools' },
  imageUrl: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  stock: { type: Number, default: -1 }, // -1 means infinite
}, { timestamps: true });

// ─── VOUCHER WALLET ──────────────────────────────────────────────────────────
const VoucherSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  listingId: { type: Schema.Types.ObjectId, ref: 'MarketplaceListing', default: null }, // Null if direct point conversion
  code: { type: String, required: true, unique: true },
  type: { type: String, enum: ['discount', 'premium_upgrade', 'gift_card', 'cash_conversion'], required: true },
  value: { type: String, required: true },
  pointsSpent: { type: Number, required: true },
  status: { type: String, enum: ['active', 'redeemed', 'expired'], default: 'active' },
  expiresAt: { type: Date },
}, { timestamps: true });

// ─── TRANSACTION HISTORY ──────────────────────────────────────────────────────
const PointTransactionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['earned', 'spent', 'converted'], required: true },
  amount: { type: Number, required: true }, // positive for earned, negative for spent/converted
  description: { type: String, required: true },
  referenceId: { type: Schema.Types.ObjectId, default: null }, // Can be SurveyId, VoucherId, etc.
  balanceAfter: { type: Number, required: true },
}, { timestamps: true });

const MarketplaceListing = mongoose.model('MarketplaceListing', MarketplaceListingSchema);
const Voucher = mongoose.model('Voucher', VoucherSchema);
const PointTransaction = mongoose.model('PointTransaction', PointTransactionSchema);

module.exports = {
  MarketplaceListing,
  Voucher,
  PointTransaction
};

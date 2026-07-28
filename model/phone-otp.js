'use strict';

const mongoose = require('mongoose');

const phoneOtpSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, index: true },
    code: { type: String, required: true, select: false },
    expiresAt: { type: Date, required: true },
    consumed: { type: Boolean, default: false },
    invalidated: { type: Boolean, default: false },
    lastRequestedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PhoneOtp', phoneOtpSchema);

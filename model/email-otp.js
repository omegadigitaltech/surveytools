'use strict';

const mongoose = require('mongoose');

const emailOtpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, index: true },
    /** select: false keeps the code off any .find() result unless explicitly selected */
    code: { type: String, required: true, select: false },
    expiresAt: { type: Date, required: true },
    consumed: { type: Boolean, default: false },
    invalidated: { type: Boolean, default: false },
    lastRequestedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('EmailOtp', emailOtpSchema);

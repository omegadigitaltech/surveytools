'use strict';

const mongoose = require('mongoose');

// Frozen enum — add new scopes here only
const CONSENT_SCOPES = Object.freeze([
  'basic_profile',
  'health_data',
  'socioeconomic_data',
  'religious_cultural_data',
  'survey_participation',
  'marketing',
]);

const consentRecordSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  scope:     { type: String, enum: CONSENT_SCOPES, required: true },
  granted:   { type: Boolean, required: true },
  grantedAt: { type: Date },
  revokedAt: { type: Date, default: null },
  // ConsentRecord rows are NEVER deleted — audit trail requirement
}, { timestamps: true });

// Compound index for fast per-user per-scope lookup
consentRecordSchema.index({ userId: 1, scope: 1 });

module.exports = mongoose.model('ConsentRecord', consentRecordSchema);
module.exports.CONSENT_SCOPES = CONSENT_SCOPES;

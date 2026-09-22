'use strict';

// dotenv is already loaded by app.js at startup via require('dotenv').config().
// This module reads env vars after that call has already executed.
// If this module is required in isolation (e.g. tests), dotenv is not yet
// loaded — callers should load it themselves or pass values through injection.

const OTP_EXPIRY_MINUTES = Number(process.env.OTP_EXPIRY_MINUTES || 10);

const rawKey = process.env.KYC_FIELD_ENCRYPTION_KEY;
const isTestEnv = process.env.NODE_ENV === 'test';

if (!rawKey && !isTestEnv) {
  throw new Error('KYC_FIELD_ENCRYPTION_KEY is required');
}

if (rawKey && !/^[a-fA-F0-9]{64}$/.test(rawKey)) {
  throw new Error('KYC_FIELD_ENCRYPTION_KEY must be a 64-character hex string');
}

module.exports = Object.freeze({
  /** API key for the SMS provider */
  smsProviderApiKey: process.env.SMS_PROVIDER_API_KEY || '',

  /** Base URL for the SMS provider HTTP API */
  smsProviderBaseUrl: process.env.SMS_PROVIDER_BASE_URL || '',

  /** OTP validity in minutes */
  otpExpiryMinutes: OTP_EXPIRY_MINUTES,

  /** OTP validity in milliseconds — used by the service to set expiresAt */
  otpExpiryMs: OTP_EXPIRY_MINUTES * 60 * 1000,

  /** Survey-completion count that triggers progressive profiling Layer 2 */
  // Layer 2 unlocks after the 1st completed survey (product doc §6)
  kycLayer2SurveyThreshold: Number(process.env.KYC_LAYER2_SURVEY_THRESHOLD || 1),
  // Layers 3 & 4 unlock after the 5th completed survey (product doc §6)
  kycSensitiveLayersSurveyThreshold: Number(process.env.KYC_SENSITIVE_LAYERS_SURVEY_THRESHOLD || 5),

  /** The 64-hex-character key used for encrypting PII/sensitive fields */
  kycFieldEncryptionKey: rawKey,
});

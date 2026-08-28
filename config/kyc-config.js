'use strict';

// dotenv is already loaded by app.js at startup via require('dotenv').config().
// This module reads env vars after that call has already executed.
// If this module is required in isolation (e.g. tests), dotenv is not yet
// loaded — callers should load it themselves or pass values through injection.

const OTP_EXPIRY_MINUTES = Number(process.env.OTP_EXPIRY_MINUTES || 10);

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
  kycLayer2SurveyThreshold: Number(process.env.KYC_LAYER2_SURVEY_THRESHOLD || 5),
});

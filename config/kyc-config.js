'use strict';

const OTP_EXPIRY_MINUTES = Number(process.env.OTP_EXPIRY_MINUTES || 10);

module.exports = Object.freeze({
  smsProviderApiKey: process.env.SMS_PROVIDER_API_KEY || '',
  smsProviderBaseUrl: process.env.SMS_PROVIDER_BASE_URL || '',
  otpExpiryMinutes: OTP_EXPIRY_MINUTES,
  otpExpiryMs: OTP_EXPIRY_MINUTES * 60 * 1000,
});

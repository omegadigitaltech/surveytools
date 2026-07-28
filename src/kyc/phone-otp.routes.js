'use strict';

const express = require('express');

const kycConfig = require('../../config/kyc-config');
const { createSmsClient } = require('../../lib/sms-client');
const PhoneOtp = require('../../model/phone-otp');
const { createPhoneOtpRepo } = require('./phone-otp.repo');
const { createPhoneOtpService } = require('./phone-otp.service');
const { createPhoneOtpController } = require('./phone-otp.controller');

const router = express.Router();

const smsClient = createSmsClient({
  apiKey: kycConfig.smsProviderApiKey,
  baseUrl: kycConfig.smsProviderBaseUrl,
});
const otpRepo = createPhoneOtpRepo({ PhoneOtp });
const phoneOtpService = createPhoneOtpService({ smsClient, otpRepo, kycConfig });
const { requestOtp, verifyOtp } = createPhoneOtpController({ phoneOtpService });

router.post('/otp/request', requestOtp);
router.post('/otp/verify', verifyOtp);

module.exports = router;

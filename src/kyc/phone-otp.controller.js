'use strict';

const { AppError } = require('../../lib/app-error');
const { createLogger } = require('../../lib/logger');
const { requestOtpBody, verifyOtpBody } = require('./phone-otp.schema');

const log = createLogger('phone-otp-controller');

/**
 * @param {{ phoneOtpService: ReturnType<import('./phone-otp.service').createPhoneOtpService> }} deps
 * @returns {{
 *   requestOtp: (req: import('express').Request, res: import('express').Response) => Promise<void>,
 *   verifyOtp: (req: import('express').Request, res: import('express').Response) => Promise<void>
 * }}
 */
function createPhoneOtpController({ phoneOtpService }) {
  async function requestOtp(req, res) {
    const result = requestOtpBody.safeParse(req.body);
    if (!result.success) {
      throw new AppError(400, result.error.errors[0].message);
    }

    const { phone } = result.data;
    await phoneOtpService.requestOtp(phone);

    res.status(200).json({
      status: 'success',
      msg: 'OTP sent to your phone number',
    });
  }

  async function verifyOtp(req, res) {
    const result = verifyOtpBody.safeParse(req.body);
    if (!result.success) {
      throw new AppError(400, result.error.errors[0].message);
    }

    const { phone, code } = result.data;
    await phoneOtpService.verifyOtp(phone, code);

    res.status(200).json({
      status: 'success',
      msg: 'Phone number verified successfully',
    });
  }

  return { requestOtp, verifyOtp };
}

module.exports = { createPhoneOtpController };

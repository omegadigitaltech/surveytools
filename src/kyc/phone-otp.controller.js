'use strict';

const { AppError } = require('../../lib/app-error');
const { createLogger } = require('../../lib/logger');
const { requestOtpBody, verifyOtpBody } = require('./phone-otp.schema');
const User = require('../../model/user');

const log = createLogger('phone-otp-controller');

/**
 * Creates the phone-OTP controller.
 * Thin layer: validates input via Zod, delegates to the service, returns JSON.
 * Never reaches into the service's internals — errors from the service propagate
 * automatically via express-async-errors.
 *
 * @param {{ phoneOtpService: ReturnType<import('./phone-otp.service').createPhoneOtpService> }} deps
 */
function createPhoneOtpController({ phoneOtpService }) {
  /**
   * POST /v1/kyc/otp/request
   * Issues a 6-digit OTP to the provided phone number.
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @returns {Promise<void>}
   */
  async function requestOtp(req, res) {
    const result = requestOtpBody.safeParse(req.body);
    if (!result.success) {
      throw new AppError(400, result.error.issues[0].message);
    }

    const { phone } = result.data;
    await phoneOtpService.requestOtp(phone);

    res.status(200).json({
      status: 'success',
      msg: 'OTP sent to your phone number',
    });
  }

  /**
   * POST /v1/kyc/otp/verify
   * Verifies the 6-digit OTP and marks it consumed.
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @returns {Promise<void>}
   */
  async function verifyOtp(req, res) {
    const result = verifyOtpBody.safeParse(req.body);
    if (!result.success) {
      throw new AppError(400, result.error.issues[0].message);
    }

    const { phone, code } = result.data;
    await phoneOtpService.verifyOtp(phone, code);

    // Update the User document now that phone is verified
    await User.findOneAndUpdate(
      { id: req.userId }, 
      { phoneVerified: true, phone: phone }
    );

    res.status(200).json({
      status: 'success',
      msg: 'Phone number verified successfully',
    });
  }

  return { requestOtp, verifyOtp };
}

module.exports = { createPhoneOtpController };

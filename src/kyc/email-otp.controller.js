'use strict';

const { StatusCodes } = require('http-status-codes');

/**
 * Creates the Express controller for Email OTP endpoints.
 *
 * @param {{ emailOtpService: { requestOtp: Function, verifyOtp: Function } }} deps
 */
function createEmailOtpController({ emailOtpService }) {
  async function requestOtp(req, res) {
    const { email } = req.body;
    await emailOtpService.requestOtp(email);

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Student OTP sent successfully',
    });
  }

  async function verifyOtp(req, res) {
    const { email, code } = req.body;
    await emailOtpService.verifyOtp(email, code);

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Student OTP verified successfully',
    });
  }

  return { requestOtp, verifyOtp };
}

module.exports = { createEmailOtpController };

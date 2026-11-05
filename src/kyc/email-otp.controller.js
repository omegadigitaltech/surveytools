'use strict';

const { StatusCodes } = require('http-status-codes');
const { AppError } = require('../../lib/app-error');
const { requestEmailOtpBody, verifyEmailOtpBody } = require('./email-otp.schema');
const User = require('../../model/user');

/**
 * Creates the Express controller for Email OTP endpoints.
 *
 * @param {{ emailOtpService: { requestOtp: Function, verifyOtp: Function } }} deps
 */
function createEmailOtpController({ emailOtpService }) {
  async function requestOtp(req, res) {
    const parsed = requestEmailOtpBody.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(StatusCodes.BAD_REQUEST, parsed.error.issues[0].message);
    }
    const { email } = parsed.data;
    await emailOtpService.requestOtp(email);

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Email OTP sent successfully',
    });
  }

  async function verifyOtp(req, res) {
    const parsed = verifyEmailOtpBody.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(StatusCodes.BAD_REQUEST, parsed.error.issues[0].message);
    }
    const { email, code } = parsed.data;
    await emailOtpService.verifyOtp(email, code);

    // Update the User document now that email is verified
    await User.findOneAndUpdate(
      { id: req.userId }, 
      { emailVerified: true, email: email }
    );

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Email OTP verified successfully',
    });
  }

  return { requestOtp, verifyOtp };
}

module.exports = { createEmailOtpController };

'use strict';

const { StatusCodes } = require('http-status-codes');
const { AppError } = require('../../lib/app-error');
const { requestAcademicEmailOtpBody, verifyAcademicEmailOtpBody } = require('./academic-email-otp.schema');
const User = require('../../model/user');

/**
 * Creates the Express controller for Academic Email OTP endpoints.
 *
 * @param {{ emailOtpService: { requestOtp: Function, verifyOtp: Function } }} deps
 */
function createAcademicEmailOtpController({ emailOtpService }) {
  async function requestOtp(req, res) {
    const parsed = requestAcademicEmailOtpBody.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(StatusCodes.BAD_REQUEST, parsed.error.issues[0].message);
    }
    const { email } = parsed.data;
    await emailOtpService.requestOtp(email);

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Academic OTP sent successfully',
    });
  }

  async function verifyOtp(req, res) {
    const parsed = verifyAcademicEmailOtpBody.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(StatusCodes.BAD_REQUEST, parsed.error.issues[0].message);
    }
    const { email, code } = parsed.data;
    await emailOtpService.verifyOtp(email, code);

    // Update the User document with academic email verification
    await User.findOneAndUpdate(
      { id: req.userId },
      {
        academicEmailVerified: true,
        academicEmail: email,
        emailVerified: true, // Verifying institutional email also verifies general email
      }
    );

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Academic OTP verified successfully',
    });
  }

  return { requestOtp, verifyOtp };
}

module.exports = { createAcademicEmailOtpController };

'use strict';

const { StatusCodes } = require('http-status-codes');
const User = require('../../model/user');

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

    // Update the User document now that email is verified
    await User.findOneAndUpdate(
      { id: req.userId }, 
      { emailVerified: true, email: email } // Optionally track student email separately if needed, but here updating the main email
    );

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Student OTP verified successfully',
    });
  }

  return { requestOtp, verifyOtp };
}

module.exports = { createEmailOtpController };

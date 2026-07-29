'use strict';

const { AppError } = require('../../lib/app-error');
const { createLogger } = require('../../lib/logger');
const crypto = require('crypto');

const log = createLogger('email-otp');

/**
 * Creates the email-OTP service.
 * Pure logic — no Express objects.
 *
 * @param {{
 *   emailClient: { send: (params: { to: string, subject: string, body: string }) => Promise<void> },
 *   otpRepo: {
 *     create: Function,
 *     findActive: Function,
 *     markConsumed: Function,
 *     invalidatePrevious: Function,
 *   },
 *   kycConfig: { otpExpiryMs: number },
 * }} deps
 */
function createEmailOtpService({ emailClient, otpRepo, kycConfig }) {
  /**
   * Issues a 6-digit OTP to the given email.
   * Any previous active OTPs are invalidated first.
   *
   * @param {string} email
   * @returns {Promise<void>}
   */
  async function requestOtp(email) {
    if (!email.endsWith('.edu.ng')) {
      throw new AppError(400, 'Student verification requires a valid .edu.ng email address');
    }

    await otpRepo.invalidatePrevious(email);

    const code = crypto.randomInt(100000, 1000000).toString();
    const expiresAt = new Date(Date.now() + kycConfig.otpExpiryMs);

    await otpRepo.create({ email, code, expiresAt });
    await emailClient.send({ 
      to: email, 
      subject: 'SurveyTools Student Verification OTP',
      body: `Your SurveyTools student verification code is ${code}. It expires in ${Math.round(kycConfig.otpExpiryMs / 60000)} minutes.` 
    });

    log.info({ email }, 'Email OTP issued');
  }

  /**
   * Verifies a 6-digit OTP submitted by the user.
   * Marks the OTP consumed on success so it cannot be replayed.
   *
   * @param {string} email
   * @param {string} code
   * @returns {Promise<true>}
   */
  async function verifyOtp(email, code) {
    const otp = await otpRepo.findActive(email);

    if (!otp) {
      throw new AppError(400, 'No active OTP for this email');
    }

    if (otp.consumed) {
      throw new AppError(400, 'OTP already used');
    }

    if (new Date() > otp.expiresAt) {
      throw new AppError(400, 'OTP has expired');
    }

    if (otp.code !== code) {
      throw new AppError(400, 'Invalid OTP');
    }

    await otpRepo.markConsumed(otp._id);
    log.info({ email }, 'Email OTP verified');
    return true;
  }

  return { requestOtp, verifyOtp };
}

module.exports = { createEmailOtpService };

'use strict';

const { AppError } = require('../../lib/app-error');
const { createLogger } = require('../../lib/logger');

const log = createLogger('phone-otp');

/**
 * Creates the phone-OTP service.
 * Pure logic — no Express objects. All dependencies are injected
 * so the service is fully testable without a real DB or SMS provider.
 *
 * @param {{
 *   smsClient: { send: (params: { to: string, body: string }) => Promise<void> },
 *   otpRepo: {
 *     create: Function,
 *     findActive: Function,
 *     markConsumed: Function,
 *     invalidatePrevious: Function,
 *   },
 *   kycConfig: { otpExpiryMs: number },
 *   userModel: object,  // Mongoose User model — used for phone uniqueness check
 * }} deps
 */
function createPhoneOtpService({ smsClient, otpRepo, kycConfig, userModel }) {
  /**
   * Issues a 6-digit OTP to the given phone number.
   * Any previous active OTPs are invalidated first.
   * The OTP code is never logged — see SURVEYTOOLS_ENGINEERING.MD §2.7.
   *
   * @param {string} phone - E.164-format phone number
   * @returns {Promise<void>}
   */
  async function requestOtp(phone) {
    await otpRepo.invalidatePrevious(phone);

    const code = require('crypto').randomInt(100000, 1000000).toString();
    const expiresAt = new Date(Date.now() + kycConfig.otpExpiryMs);

    await otpRepo.create({ phone, code, expiresAt });
    await smsClient.send({ to: phone, body: `Your SurveyTools verification code is ${code}` });

    // OTP code is intentionally absent from this log line.
    log.info({ phone }, 'OTP issued');
  }

  /**
   * Verifies a 6-digit OTP submitted by the user.
   * Marks the OTP consumed on success so it cannot be replayed.
   * Rejects if the phone number is already verified on a different account.
   *
   * @param {string} phone - E.164-format phone number
   * @param {string} code - 6-digit OTP provided by the user
   * @param {string} requestingUserId - the `id` field of the user making this call
   * @returns {Promise<true>}
   * @throws {AppError} 400 if no active OTP, already consumed, expired, or wrong code
   * @throws {AppError} 409 if phone is already verified on a different account
   */
  async function verifyOtp(phone, code, requestingUserId) {
    // Gap 4 fix: reject if this number is already verified on a DIFFERENT account
    if (userModel) {
      const existing = await userModel.findOne({ phone, phoneVerified: true }).select('id').lean();
      if (existing && existing.id !== requestingUserId) {
        throw new AppError(409, 'This phone number is already verified on another account');
      }
    }

    const otp = await otpRepo.findActive(phone);

    if (!otp) {
      throw new AppError(400, 'No active OTP for this number');
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
    log.info({ phone }, 'OTP verified');
    return true;
  }

  return { requestOtp, verifyOtp };
}

module.exports = { createPhoneOtpService };

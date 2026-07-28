'use strict';

const { AppError } = require('../../lib/app-error');
const { createLogger } = require('../../lib/logger');

const log = createLogger('phone-otp');

/**
 * @param {{
 *   smsClient: { send: (params: { to: string, body: string }) => Promise<void> },
 *   otpRepo: {
 *     create: Function,
 *     findActive: Function,
 *     markConsumed: Function,
 *     invalidatePrevious: Function,
 *   },
 *   kycConfig: { otpExpiryMs: number },
 * }} deps
 * @returns {{
 *   requestOtp: (phone: string) => Promise<void>,
 *   verifyOtp: (phone: string, code: string) => Promise<true>
 * }}
 */
function createPhoneOtpService({ smsClient, otpRepo, kycConfig }) {
  async function requestOtp(phone) {
    await otpRepo.invalidatePrevious(phone);

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + kycConfig.otpExpiryMs);

    await otpRepo.create({ phone, code, expiresAt });
    await smsClient.send({ to: phone, body: `Your SurveyTools verification code is ${code}` });

    log.info({ phone }, 'OTP issued');
  }

  async function verifyOtp(phone, code) {
    const otp = await otpRepo.findActive(phone);

    if (!otp) throw new AppError(400, 'No active OTP for this number');
    if (otp.consumed) throw new AppError(400, 'OTP already used');
    if (new Date() > otp.expiresAt) throw new AppError(400, 'OTP has expired');
    if (otp.code !== code) throw new AppError(400, 'Invalid OTP');

    await otpRepo.markConsumed(otp._id);
    log.info({ phone }, 'OTP verified');
    return true;
  }

  return { requestOtp, verifyOtp };
}

module.exports = { createPhoneOtpService };

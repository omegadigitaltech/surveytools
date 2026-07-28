'use strict';

/**
 * @param {{ PhoneOtp: import('mongoose').Model }} deps
 * @returns {{
 *   create: (data: { phone: string, code: string, expiresAt: Date }) => Promise<void>,
 *   findActive: (phone: string) => Promise<object|null>,
 *   markConsumed: (id: string) => Promise<void>,
 *   invalidatePrevious: (phone: string) => Promise<void>,
 * }}
 */
function createPhoneOtpRepo({ PhoneOtp }) {
  async function create(data) {
    await PhoneOtp.create({
      phone: data.phone,
      code: data.code,
      expiresAt: data.expiresAt,
      lastRequestedAt: new Date(),
    });
  }

  async function findActive(phone) {
    return PhoneOtp.findOne(
      { phone, invalidated: false, consumed: false },
      null,
      { sort: { createdAt: -1 } }
    ).select('+code').lean();
  }

  async function markConsumed(id) {
    await PhoneOtp.findByIdAndUpdate(id, { consumed: true });
  }

  async function invalidatePrevious(phone) {
    await PhoneOtp.updateMany(
      { phone, consumed: false, invalidated: false },
      { invalidated: true }
    );
  }

  return { create, findActive, markConsumed, invalidatePrevious };
}

module.exports = { createPhoneOtpRepo };

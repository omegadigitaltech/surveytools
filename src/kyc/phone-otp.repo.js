'use strict';

/**
 * Creates the phone-OTP repository.
 * All Mongoose interactions for phone OTPs go through this factory —
 * keeping the service layer free of direct model dependencies and enabling
 * test injection via a mock repo.
 *
 * @param {{ PhoneOtp: import('mongoose').Model }} deps
 * @returns {{
 *   create: (data: { phone: string, code: string, expiresAt: Date }) => Promise<void>,
 *   findActive: (phone: string) => Promise<object|null>,
 *   markConsumed: (id: string) => Promise<void>,
 *   invalidatePrevious: (phone: string) => Promise<void>,
 * }}
 */
function createPhoneOtpRepo({ PhoneOtp }) {
  /**
   * Persists a new OTP record.
   *
   * @param {{ phone: string, code: string, expiresAt: Date }} data
   * @returns {Promise<void>}
   */
  async function create(data) {
    await PhoneOtp.create({
      phone: data.phone,
      code: data.code,
      expiresAt: data.expiresAt,
      lastRequestedAt: new Date(),
    });
  }

  /**
   * Finds the most recent, non-invalidated, non-consumed OTP for a phone.
   * Explicitly selects `code` because it is projected out by default (select: false).
   *
   * @param {string} phone
   * @returns {Promise<object|null>}
   */
  async function findActive(phone) {
    return PhoneOtp.findOne(
      { phone, invalidated: false, consumed: false },
      null,
      { sort: { createdAt: -1 } }
    ).select('+code').lean();
  }

  /**
   * Marks an OTP record as consumed so it cannot be replayed.
   *
   * @param {string} id - Mongoose _id
   * @returns {Promise<void>}
   */
  async function markConsumed(id) {
    await PhoneOtp.findByIdAndUpdate(id, { consumed: true });
  }

  /**
   * Invalidates all prior active OTPs for a phone number before issuing a new one.
   * Prevents accumulation of usable OTPs when a user re-requests.
   *
   * @param {string} phone
   * @returns {Promise<void>}
   */
  async function invalidatePrevious(phone) {
    await PhoneOtp.updateMany(
      { phone, consumed: false, invalidated: false },
      { invalidated: true }
    );
  }

  return { create, findActive, markConsumed, invalidatePrevious };
}

module.exports = { createPhoneOtpRepo };

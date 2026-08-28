'use strict';

/**
 * Creates the email-OTP repository.
 * All Mongoose interactions for email OTPs go through this factory.
 *
 * @param {{ EmailOtp: import('mongoose').Model }} deps
 * @returns {{
 *   create: (data: { email: string, code: string, expiresAt: Date }) => Promise<void>,
 *   findActive: (email: string) => Promise<object|null>,
 *   markConsumed: (id: string) => Promise<void>,
 *   invalidatePrevious: (email: string) => Promise<void>,
 * }}
 */
function createEmailOtpRepo({ EmailOtp }) {
  /**
   * Persists a new OTP record.
   *
   * @param {{ email: string, code: string, expiresAt: Date }} data
   * @returns {Promise<void>}
   */
  async function create(data) {
    await EmailOtp.create({
      email: data.email,
      code: data.code,
      expiresAt: data.expiresAt,
      lastRequestedAt: new Date(),
    });
  }

  /**
   * Finds the most recent, non-invalidated, non-consumed OTP for an email.
   * Explicitly selects `code` because it is projected out by default (select: false).
   *
   * @param {string} email
   * @returns {Promise<object|null>}
   */
  async function findActive(email) {
    return EmailOtp.findOne(
      { email, invalidated: false, consumed: false },
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
    await EmailOtp.findByIdAndUpdate(id, { consumed: true });
  }

  /**
   * Invalidates all prior active OTPs for an email before issuing a new one.
   * Prevents accumulation of usable OTPs when a user re-requests.
   *
   * @param {string} email
   * @returns {Promise<void>}
   */
  async function invalidatePrevious(email) {
    await EmailOtp.updateMany(
      { email, consumed: false, invalidated: false },
      { invalidated: true }
    );
  }

  return { create, findActive, markConsumed, invalidatePrevious };
}

module.exports = { createEmailOtpRepo };

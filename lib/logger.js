'use strict';

const pino = require('pino');

/**
<<<<<<< HEAD
 * Creates a scoped pino logger for a named module.
 *
 * Usage:
 *   const { createLogger } = require('../lib/logger');
 *   const log = createLogger('phone-otp');
 *   log.info({ userId }, 'OTP issued');
 *
 * Never log OTP codes, passwords, tokens, or sensitive profile fields.
 *
 * @param {string} scope - Short module identifier, e.g. 'phone-otp', 'kyc'
=======
 * @param {string} scope
>>>>>>> 2c84176... feat(kyc): add shared sign-up entry point with age gate and additive user schema fields
 * @returns {import('pino').Logger}
 */
function createLogger(scope) {
  return pino({ name: scope });
}

module.exports = { createLogger };

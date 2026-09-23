'use strict';

const User = require('../../model/user');
const { AppError } = require('../../lib/app-error');

/**
 * Middleware that ensures a user has verified their phone number.
 * Throws a 403 AppError if phoneVerified is false.
 */
async function requirePhoneVerified(req, res, next) {
  const user = await User.findOne({ id: req.userId }).select('phoneVerified');
  if (!user || !user.phoneVerified) {
    throw new AppError(403, 'Phone verification required before redemption');
  }
  next();
}

module.exports = { requirePhoneVerified };

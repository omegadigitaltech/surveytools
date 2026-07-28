'use strict';

const { AppError } = require('./app-error');

/**
 * Throws AppError(400) if age computed from dateOfBirth is below minAge.
 * @param {string|Date} dateOfBirth
 * @param {number} minAge
 */
function assertMinAge(dateOfBirth, minAge = 18) {
  const ageMs = Date.now() - new Date(dateOfBirth).getTime();
  const age   = Math.floor(ageMs / (365.25 * 24 * 60 * 60 * 1000));
  if (age < minAge) throw new AppError(400, `Must be ${minAge} or older`);
}

module.exports = { assertMinAge };

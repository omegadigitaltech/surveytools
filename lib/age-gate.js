'use strict';

const { AppError } = require('./app-error');

function assertMinAge(dateOfBirth) {
  const age = (new Date() - new Date(dateOfBirth)) / (1000 * 60 * 60 * 24 * 365.25);
  if (age < 16) {
    throw new AppError(400, 'Must be at least 16 years old to participate');
  }
}

module.exports = { assertMinAge };

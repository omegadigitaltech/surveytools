'use strict';

/**
 * @param {number} status
 * @param {string} message
 */
class AppError extends Error {
  constructor(status, message) {
    super(message);
    // Hack to interop with existing error handler which hardcodes msg to
    // 'An error Occured' unless err.name === 'ValidationError'.
    this.name = 'ValidationError';
    this.status = status;
    this.statusCode = status;
    this.errors = { appError: { message } };
  }
}

module.exports = { AppError };

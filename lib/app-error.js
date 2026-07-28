'use strict';

/**
<<<<<<< HEAD
 * Application error class that interoperates with the existing global error
 * handler in middleware/error-handler.js.
 *
 * The existing handler reads err.statusCode for the HTTP response status.
 * We set both err.status and err.statusCode so this class works whether
 * callers read one or the other.
 */
class AppError extends Error {
  /**
   * @param {number} status - HTTP status code (e.g. 400, 404, 409, 500)
   * @param {string} message - Human-readable error message
   */
=======
 * @param {number} status
 * @param {string} message
 */
class AppError extends Error {
>>>>>>> 2c84176... feat(kyc): add shared sign-up entry point with age gate and additive user schema fields
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

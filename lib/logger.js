'use strict';

const pino = require('pino');

/**
 * @param {string} scope
 * @returns {import('pino').Logger}
 */
function createLogger(scope) {
  return pino({ name: scope });
}

module.exports = { createLogger };

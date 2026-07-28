'use strict';

const { createLogger } = require('./logger');
const log = createLogger('sms-client');

/**
 * Creates an injectable SMS adapter.
 *
 * The adapter wraps a generic HTTP SMS provider. Inject a custom
 * `sendFn` in tests to avoid real network calls.
 *
 * @param {{ apiKey: string, baseUrl: string, sendFn?: Function }} options
 * @returns {{ send: (params: { to: string, body: string }) => Promise<void> }}
 */
function createSmsClient({ apiKey, baseUrl, sendFn }) {
  /**
   * Sends an SMS message.
   *
   * @param {{ to: string, body: string }} params
   * @returns {Promise<void>}
   */
  async function send({ to, body }) {
    // sendFn is injected in tests; in production the real HTTP call runs.
    if (typeof sendFn === 'function') {
      await sendFn({ to, body, apiKey, baseUrl });
      return;
    }

    const response = await fetch(`${baseUrl}/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ to, message: body }),
    });

    if (!response.ok) {
      // Log enough detail to diagnose failures without leaking message body.
      log.error({ to, status: response.status }, 'SMS delivery failed');
      throw new Error(`SMS provider returned ${response.status}`);
    }

    log.info({ to }, 'SMS sent');
  }

  return { send };
}

module.exports = { createSmsClient };

'use strict';

const { createLogger } = require('./logger');
const log = createLogger('sms-client');

/**
 * @param {{ apiKey: string, baseUrl: string, sendFn?: Function }} options
 * @returns {{ send: (params: { to: string, body: string }) => Promise<void> }}
 */
function createSmsClient({ apiKey, baseUrl, sendFn }) {
  async function send({ to, body }) {
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
      log.error({ to, status: response.status }, 'SMS delivery failed');
      throw new Error(`SMS provider returned ${response.status}`);
    }

    log.info({ to }, 'SMS sent');
  }

  return { send };
}

module.exports = { createSmsClient };

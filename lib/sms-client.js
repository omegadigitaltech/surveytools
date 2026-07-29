'use strict';

const { createLogger } = require('./logger');
const log = createLogger('sms-client');
let twilioClient = null;

/**
 * Creates an injectable SMS adapter.
 *
 * @param {{ apiKey: string, baseUrl: string, sendFn?: Function }} options
 * @returns {{ send: (params: { to: string, body: string }) => Promise<void> }}
 */
function createSmsClient({ apiKey, baseUrl, sendFn }) {
  // If we are using Twilio, initialization happens here
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    try {
      const twilio = require('twilio');
      twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      log.info('Twilio client initialized');
    } catch (e) {
      log.error('Failed to initialize Twilio client. Make sure twilio package is installed.');
    }
  }

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

    if (twilioClient && process.env.TWILIO_PHONE_NUMBER) {
      try {
        const message = await twilioClient.messages.create({
          body: body,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: to
        });
        log.info({ to, sid: message.sid }, 'Twilio SMS sent');
        return;
      } catch (err) {
        log.error({ to, error: err.message }, 'Twilio SMS delivery failed');
        throw new Error(`Twilio delivery failed: ${err.message}`);
      }
    }

    if (!baseUrl || baseUrl.trim() === '') {
      // In development, if no URL/Twilio is provided, just log it.
      if (process.env.NODE_ENV !== 'production') {
        log.warn({ to, body }, 'MOCK SMS PROVIDER: OTP sent to console (No base URL or Twilio configured)');
        return;
      }
      throw new Error('SMS Provider is not configured (Missing TWILIO_ACCOUNT_SID or SMS_PROVIDER_BASE_URL)');
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
      log.error({ to, status: response.status }, 'Generic SMS delivery failed');
      throw new Error(`SMS provider returned ${response.status}`);
    }

    log.info({ to }, 'Generic SMS sent');
  }

  return { send };
}

module.exports = { createSmsClient };

'use strict';

const nodemailer = require('nodemailer');
const { createLogger } = require('./logger');

const log = createLogger('email-client');

/**
 * Creates an email client instance wrapped around nodemailer.
 *
 * @param {{ host: string, port: number, user: string, pass: string, from: string }} config
 * @returns {{ send: (params: { to: string, subject: string, body: string }) => Promise<void> }}
 */
function createEmailClient(config) {
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465, // true for 465, false for other ports
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });

  async function send({ to, subject, body }) {
    // If we are in development and haven't configured a real SMTP user, mock it!
    if (process.env.NODE_ENV !== 'production' && (!config.user || config.user === 'test-user')) {
      log.warn({ to, subject, body }, 'MOCK EMAIL PROVIDER: Email sent to console');
      return;
    }

    try {
      await transporter.sendMail({
        from: config.from,
        to,
        subject,
        text: body,
      });
      log.info({ to }, 'Email dispatched successfully');
    } catch (err) {
      log.error({ err, to }, 'Failed to send email');
      throw err;
    }
  }

  return { send };
}

module.exports = { createEmailClient };

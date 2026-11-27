'use strict';

const https = require('https');
const axios = require('axios');

const { AppError } = require('./app-error');

const BREVO_ENDPOINT = 'https://api.brevo.com/v3/smtp/email';
// Force IPv4 to avoid Node Happy Eyeballs AggregateError/ETIMEDOUT on WSL2 IPv6
const ipv4Agent = new https.Agent({ family: 4 });

/**
 * Returns true when a Brevo HTTP API key is present in the environment.
 *
 * @returns {boolean}
 */
function isBrevoConfigured() {
  return Boolean(process.env.BREVO_API_KEY && process.env.BREVO_API_KEY.trim());
}

/**
 * Sends a transactional email via Brevo's HTTPS REST API (port 443).
 * Used on hosts like Render Free tier where outbound SMTP ports are blocked.
 *
 * @param {{
 *   to: string | string[],
 *   subject: string,
 *   html?: string,
 *   text?: string,
 *   fromEmail?: string,
 *   fromName?: string,
 * }} params
 * @returns {Promise<object>}
 */
async function sendViaBrevo({ to, subject, html, text, fromEmail, fromName }) {
  const apiKey = (process.env.BREVO_API_KEY || '').trim();
  if (!apiKey) {
    throw new AppError(500, 'BREVO_API_KEY is not configured');
  }

  const senderEmail = (
    process.env.BREVO_SENDER_EMAIL ||
    fromEmail ||
    process.env.EMAIL ||
    process.env.SMTP_FROM ||
    ''
  ).trim();

  if (!senderEmail) {
    throw new AppError(500, 'BREVO_SENDER_EMAIL is not configured');
  }

  const senderName = (process.env.BREVO_SENDER_NAME || fromName || 'SurveyTools').trim();
  const recipients = (Array.isArray(to) ? to : [to]).map((entry) =>
    typeof entry === 'string' ? { email: entry } : entry
  );

  const payload = {
    sender: { name: senderName, email: senderEmail },
    to: recipients,
    subject,
  };

  if (html) payload.htmlContent = html;
  if (text) payload.textContent = text;
  if (!html && !text) payload.textContent = subject;

  try {
    const response = await axios.post(BREVO_ENDPOINT, payload, {
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      httpsAgent: ipv4Agent,
      timeout: 15000,
    });
    return response.data;
  } catch (err) {
    let detail;
    if (err.response && err.response.data) {
      detail = typeof err.response.data === 'string'
        ? err.response.data
        : JSON.stringify(err.response.data);
    } else if (Array.isArray(err.errors) && err.errors.length) {
      detail = err.errors.map((e) => e.message || e.code || String(e)).join('; ');
    } else {
      detail = err.message || err.code || err.name || 'Unknown network error';
    }
    throw new AppError(502, `Brevo API error: ${detail}`);
  }
}

module.exports = { isBrevoConfigured, sendViaBrevo, BREVO_ENDPOINT };


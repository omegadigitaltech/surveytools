'use strict';

const isTestEnv = process.env.NODE_ENV === 'test';

if (!isTestEnv) {
  if (!process.env.TYPEFORM_WEBHOOK_SECRET) {
    throw new Error('TYPEFORM_WEBHOOK_SECRET is required');
  }
  if (!process.env.TALLY_WEBHOOK_SECRET) {
    throw new Error('TALLY_WEBHOOK_SECRET is required');
  }
}

module.exports = Object.freeze({
  /** Typeform personal access token */
  typeformApiKey: process.env.TYPEFORM_API_KEY || '',

  /** Typeform HMAC-SHA256 webhook signing secret */
  typeformWebhookSecret: process.env.TYPEFORM_WEBHOOK_SECRET || '',

  /** Tally API key */
  tallyApiKey: process.env.TALLY_API_KEY || '',

  /** Tally HMAC-SHA256 webhook signing secret */
  tallyWebhookSecret: process.env.TALLY_WEBHOOK_SECRET || '',

  /**
   * Publicly reachable base URL for this server.
   * Used to build webhook callback URLs registered with Typeform and Tally.
   * Example: https://api.surveytools.ng
   */
  webhookBaseUrl: process.env.FORM_INTEGRATION_WEBHOOK_BASE_URL || '',

  /** Google OAuth2 client ID (Phase 2) */
  googleClientId: process.env.GOOGLE_FORMS_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || '',

  /** Google OAuth2 client secret (Phase 2) */
  googleClientSecret: process.env.GOOGLE_FORMS_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET || '',

  /** Google OAuth2 redirect URI (Phase 2) */
  googleRedirectUri: process.env.GOOGLE_FORMS_REDIRECT_URI || 'http://localhost:5000/v1/forms/oauth/google/callback',

  /** How often (ms) to poll Google Forms for new responses (Phase 2) */
  googlePollIntervalMs: Number(process.env.GOOGLE_FORMS_POLL_INTERVAL_MS || 1800000),
});

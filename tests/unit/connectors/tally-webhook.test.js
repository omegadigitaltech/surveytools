'use strict';

const crypto = require('crypto');
const { parseWebhookPayload } = require('../../../src/form-integration/connectors/tally.connector');
const { AppError } = require('../../../lib/app-error');

describe('Tally Webhook Authentication', () => {
  const secret = 'tally_test_secret';
  const validPayload = JSON.stringify({ data: { formId: 'tally-form-99' } });

  it('should pass with a valid signature', () => {
    const rawBody = Buffer.from(validPayload);
    const computed = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');

    const result = parseWebhookPayload(rawBody, computed, secret);
    expect(result.platformFormId).toBe('tally-form-99');
    expect(result.newResponseCount).toBeNull();
  });

  it('should throw 401 for an invalid signature', () => {
    const rawBody = Buffer.from(validPayload);
    const badSignature = 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef';

    expect(() => parseWebhookPayload(rawBody, badSignature, secret)).toThrow(AppError);
  });

  it('should throw 401 for a missing signature', () => {
    const rawBody = Buffer.from(validPayload);

    expect(() => parseWebhookPayload(rawBody, '', secret)).toThrow(AppError);
    expect(() => parseWebhookPayload(rawBody, null, secret)).toThrow(AppError);
    expect(() => parseWebhookPayload(rawBody, undefined, secret)).toThrow(AppError);
  });

  it('should throw 400 when payload is missing formId', () => {
    const rawBody = Buffer.from(JSON.stringify({ data: {} }));
    const computed = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');

    expect(() => parseWebhookPayload(rawBody, computed, secret)).toThrow(AppError);
  });
});

'use strict';

const crypto = require('crypto');
const { parseWebhookPayload } = require('../../../src/form-integration/connectors/typeform.connector');
const { AppError } = require('../../../lib/app-error');

describe('Typeform Webhook Authentication', () => {
  const secret = 'my_test_secret';
  const validPayload = JSON.stringify({ form_id: '12345' });
  
  it('should pass with a valid signature', () => {
    const rawBody = Buffer.from(validPayload);
    const computed = crypto.createHmac('sha256', secret).update(rawBody).digest('base64');
    const signature = `sha256=${computed}`;
    
    const result = parseWebhookPayload(rawBody, signature, secret);
    expect(result.platformFormId).toBe('12345');
    expect(result.newResponseCount).toBeNull();
  });

  it('should throw 401 for an invalid signature', () => {
    const rawBody = Buffer.from(validPayload);
    const signature = `sha256=invalidbase64signature123`;
    
    expect(() => parseWebhookPayload(rawBody, signature, secret)).toThrow(AppError);
    expect(() => parseWebhookPayload(rawBody, signature, secret)).toThrow(/signature verification failed/i);
  });

  it('should throw 401 for a missing signature', () => {
    const rawBody = Buffer.from(validPayload);
    
    expect(() => parseWebhookPayload(rawBody, '', secret)).toThrow(AppError);
    expect(() => parseWebhookPayload(rawBody, null, secret)).toThrow(AppError);
    expect(() => parseWebhookPayload(rawBody, undefined, secret)).toThrow(AppError);
  });
});

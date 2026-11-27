'use strict';

const axios = require('axios');
const { isBrevoConfigured, sendViaBrevo, BREVO_ENDPOINT } = require('../../lib/brevo-email');
const { createEmailClient } = require('../../lib/email-client');

jest.mock('axios');

describe('Brevo HTTP Email Transport', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    delete process.env.BREVO_API_KEY;
    delete process.env.BREVO_SENDER_EMAIL;
    delete process.env.BREVO_SENDER_NAME;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('isBrevoConfigured returns false when BREVO_API_KEY is unset and true when set', () => {
    expect(isBrevoConfigured()).toBe(false);
    process.env.BREVO_API_KEY = 'xkeysib-test-key';
    expect(isBrevoConfigured()).toBe(true);
  });

  it('sendViaBrevo posts payload over HTTPS with api-key header', async () => {
    process.env.BREVO_API_KEY = 'xkeysib-test-key';
    process.env.BREVO_SENDER_EMAIL = 'sender@gmail.com';
    process.env.BREVO_SENDER_NAME = 'SurveyTools Test';
    axios.post.mockResolvedValue({ data: { messageId: '<msg-1>' } });

    const res = await sendViaBrevo({
      to: 'recipient@example.com',
      subject: 'Your OTP',
      text: 'Code: 123456',
    });

    expect(res).toEqual({ messageId: '<msg-1>' });
    expect(axios.post).toHaveBeenCalledWith(
      BREVO_ENDPOINT,
      {
        sender: { name: 'SurveyTools Test', email: 'sender@gmail.com' },
        to: [{ email: 'recipient@example.com' }],
        subject: 'Your OTP',
        textContent: 'Code: 123456',
      },
      expect.objectContaining({
        headers: expect.objectContaining({ 'api-key': 'xkeysib-test-key' }),
        timeout: 15000,
      })
    );
  });

  it('sendViaBrevo wraps Brevo HTTP errors with response detail', async () => {
    process.env.BREVO_API_KEY = 'xkeysib-test-key';
    process.env.BREVO_SENDER_EMAIL = 'sender@gmail.com';
    axios.post.mockRejectedValue({
      message: 'Request failed with status code 400',
      response: { data: { code: 'invalid_parameter', message: 'sender not valid' } },
    });

    await expect(
      sendViaBrevo({ to: 'a@b.com', subject: 'Hi', text: 'Body' })
    ).rejects.toMatchObject({ status: 502, message: expect.stringMatching(/Brevo API error:.*sender not valid/) });
  });

  it('sendViaBrevo throws AppError 500 when BREVO_API_KEY is missing', async () => {
    await expect(
      sendViaBrevo({ to: 'a@b.com', subject: 'Hi', text: 'Body' })
    ).rejects.toMatchObject({ status: 500, message: 'BREVO_API_KEY is not configured' });
  });

  it('sendViaBrevo extracts details from AggregateError with empty message', async () => {
    process.env.BREVO_API_KEY = 'xkeysib-test-key';
    process.env.BREVO_SENDER_EMAIL = 'sender@gmail.com';
    const aggErr = new AggregateError(
      [Object.assign(new Error('connect ETIMEDOUT 2a06:98c1:3200::90:80:443'), { code: 'ETIMEDOUT' })],
      ''
    );
    axios.post.mockRejectedValue(aggErr);

    await expect(
      sendViaBrevo({ to: 'a@b.com', subject: 'Hi', text: 'Body' })
    ).rejects.toThrow(/Brevo API error:.*ETIMEDOUT/);
  });

  it('createEmailClient routes through Brevo when BREVO_API_KEY is configured', async () => {
    process.env.BREVO_API_KEY = 'xkeysib-test-key';
    process.env.BREVO_SENDER_EMAIL = 'sender@gmail.com';
    axios.post.mockResolvedValue({ data: { messageId: '<msg-2>' } });

    const client = createEmailClient({
      host: 'smtp.gmail.com',
      port: 465,
      user: 'smtp-user',
      pass: 'smtp-pass',
      from: 'fallback@surveytools.ng',
    });

    await client.send({
      to: 'user@ui.edu.ng',
      subject: 'SurveyTools Email Verification',
      body: 'Your code is 654321',
    });

    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.post.mock.calls[0][1].sender.email).toBe('sender@gmail.com');
    expect(axios.post.mock.calls[0][1].to).toEqual([{ email: 'user@ui.edu.ng' }]);
  });
});


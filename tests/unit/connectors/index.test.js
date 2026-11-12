'use strict';

const { detectPlatform } = require('../../../src/form-integration/connectors');
const { AppError } = require('../../../lib/app-error');

describe('Connectors Allowlist (SSRF Protection)', () => {
  it('should detect Typeform URLs correctly', () => {
    expect(detectPlatform('https://myform.typeform.com/to/ABCDEF')).toBe('typeform');
    expect(detectPlatform('https://typeform.com/to/ABCDEF')).toBe('typeform');
  });

  it('should detect Tally URLs correctly', () => {
    expect(detectPlatform('https://tally.so/r/ABCDEF')).toBe('tally');
    expect(detectPlatform('https://tally.so/forms/ABCDEF')).toBe('tally');
  });

  it('should detect Google Forms URLs correctly', () => {
    expect(detectPlatform('https://docs.google.com/forms/d/123/edit')).toBe('google_forms');
  });

  it('should reject non-allowed domains (SSRF protection)', () => {
    expect(() => detectPlatform('http://169.254.169.254/metadata')).toThrow(AppError);
    expect(() => detectPlatform('https://example.com')).toThrow(AppError);
    expect(() => detectPlatform('https://evil.typeform.com.evil.com/to/ABCDEF')).toThrow(AppError);
  });

  it('should reject malformed URLs', () => {
    expect(() => detectPlatform('not-a-url')).toThrow(AppError);
    expect(() => detectPlatform('')).toThrow(AppError);
  });
});

import { isSmtpConfigured } from '../smtp-client';

describe('isSmtpConfigured', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should return true when both GMAIL_USER and GMAIL_APP_PASSWORD are set', () => {
    process.env.GMAIL_USER = 'test@gmail.com';
    process.env.GMAIL_APP_PASSWORD = 'app-password';
    expect(isSmtpConfigured()).toBe(true);
  });

  it('should return false when GMAIL_USER is missing', () => {
    delete process.env.GMAIL_USER;
    process.env.GMAIL_APP_PASSWORD = 'app-password';
    expect(isSmtpConfigured()).toBe(false);
  });

  it('should return false when GMAIL_APP_PASSWORD is missing', () => {
    process.env.GMAIL_USER = 'test@gmail.com';
    delete process.env.GMAIL_APP_PASSWORD;
    expect(isSmtpConfigured()).toBe(false);
  });

  it('should return false when both are missing', () => {
    delete process.env.GMAIL_USER;
    delete process.env.GMAIL_APP_PASSWORD;
    expect(isSmtpConfigured()).toBe(false);
  });

  it('should return false when GMAIL_USER is empty string', () => {
    process.env.GMAIL_USER = '';
    process.env.GMAIL_APP_PASSWORD = 'app-password';
    expect(isSmtpConfigured()).toBe(false);
  });

  it('should return false when GMAIL_APP_PASSWORD is empty string', () => {
    process.env.GMAIL_USER = 'test@gmail.com';
    process.env.GMAIL_APP_PASSWORD = '';
    expect(isSmtpConfigured()).toBe(false);
  });
});

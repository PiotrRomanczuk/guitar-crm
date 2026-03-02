import {
  guardTestAccountMutation,
  assertNotTestAccount,
  TEST_ACCOUNT_MUTATION_ERROR,
} from '../test-account-guard';

describe('guardTestAccountMutation', () => {
  it('returns error object when isDevelopment is true', () => {
    const result = guardTestAccountMutation(true);
    expect(result).toEqual({
      success: false,
      error: TEST_ACCOUNT_MUTATION_ERROR,
    });
  });

  it('returns null when isDevelopment is false', () => {
    const result = guardTestAccountMutation(false);
    expect(result).toBeNull();
  });
});

describe('assertNotTestAccount', () => {
  it('throws Error with correct message when isDevelopment is true', () => {
    expect(() => assertNotTestAccount(true)).toThrow(
      TEST_ACCOUNT_MUTATION_ERROR
    );
  });

  it('does not throw when isDevelopment is false', () => {
    expect(() => assertNotTestAccount(false)).not.toThrow();
  });
});

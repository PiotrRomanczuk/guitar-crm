export const TEST_ACCOUNT_MUTATION_ERROR =
  'This action is not available on test accounts';

/** For server actions that return `{ success, error }` */
export function guardTestAccountMutation(isDevelopment: boolean) {
  if (isDevelopment)
    return { success: false as const, error: TEST_ACCOUNT_MUTATION_ERROR };
  return null;
}

/** For server actions that throw on error */
export function assertNotTestAccount(isDevelopment: boolean) {
  if (isDevelopment) throw new Error(TEST_ACCOUNT_MUTATION_ERROR);
}

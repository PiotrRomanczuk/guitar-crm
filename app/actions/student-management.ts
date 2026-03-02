'use server';

import { createShadowStudent } from '@/lib/services/import-utils';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { guardTestAccountMutation } from '@/lib/auth/test-account-guard';

export async function createStudentProfile(
  email: string,
  firstName: string,
  lastName: string
) {
  const { user, isTeacher, isDevelopment } = await getUserWithRolesSSR();
  const guard = guardTestAccountMutation(isDevelopment);
  if (guard) return guard;

  if (!user || !isTeacher) {
    return { success: false, error: 'Unauthorized' };
  }
  
  return await createShadowStudent(email, firstName, lastName);
}

'use server';

import { createShadowStudent } from '@/lib/services/import-utils';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';

export async function createStudentProfile(
  email: string,
  firstName: string,
  lastName: string
) {
  const { user, isTeacher } = await getUserWithRolesSSR();
  
  if (!user || !isTeacher) {
    return { success: false, error: 'Unauthorized' };
  }
  
  return await createShadowStudent(email, firstName, lastName);
}

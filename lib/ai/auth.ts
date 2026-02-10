/**
 * AI Authentication & Authorization
 *
 * Validates user sessions and enforces role-based access for AI server actions.
 * [BMS-107]
 */

import { createClient } from '@/lib/supabase/server';

export interface AIAuthUser {
  id: string;
  role: 'admin' | 'teacher' | 'student';
  email: string;
}

export class AIAuthError extends Error {
  public readonly code: 'UNAUTHENTICATED' | 'FORBIDDEN';
  public readonly status: number;

  constructor(code: 'UNAUTHENTICATED' | 'FORBIDDEN', message: string) {
    super(message);
    this.name = 'AIAuthError';
    this.code = code;
    this.status = code === 'UNAUTHENTICATED' ? 401 : 403;
  }
}

/**
 * Require an authenticated user session for AI operations.
 * Fetches the current user from Supabase auth and their role from profiles.
 *
 * @throws {AIAuthError} if no valid session or user not found
 */
export async function requireAIAuth(): Promise<AIAuthUser> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new AIAuthError('UNAUTHENTICATED', 'Authentication required to use AI features.');
  }

  // Fetch user role from profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const role = (profile?.role as AIAuthUser['role']) || 'student';

  return {
    id: user.id,
    role,
    email: user.email || '',
  };
}

/**
 * Check if a user role is allowed to use a specific agent category.
 */
export function assertAgentAccess(
  userRole: AIAuthUser['role'],
  requiredRoles: readonly string[]
): void {
  if (!requiredRoles.includes(userRole)) {
    throw new AIAuthError(
      'FORBIDDEN',
      `Role '${userRole}' is not permitted to use this AI feature.`
    );
  }
}

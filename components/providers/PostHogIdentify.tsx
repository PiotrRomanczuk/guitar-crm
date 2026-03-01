'use client';

import { useEffect } from 'react';
import { usePostHog } from 'posthog-js/react';

interface PostHogIdentifyProps {
  userId: string | null;
  email: string | null;
  isAdmin: boolean;
  isTeacher: boolean;
  isStudent: boolean;
}

export function PostHogIdentify({ userId, email, isAdmin, isTeacher, isStudent }: PostHogIdentifyProps) {
  const posthog = usePostHog();

  useEffect(() => {
    if (!posthog) return;

    if (userId) {
      posthog.identify(userId, {
        email: email ?? undefined,
        is_admin: isAdmin,
        is_teacher: isTeacher,
        is_student: isStudent,
      });
    } else {
      posthog.reset();
    }
  }, [posthog, userId, email, isAdmin, isTeacher, isStudent]);

  return null;
}

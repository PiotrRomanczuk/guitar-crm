'use client';

import { lazy, Suspense } from 'react';
import { useLayoutMode } from '@/hooks/use-is-widescreen';
import { SkillBrowserMobile } from './SkillBrowser.Mobile';
import { SkillBrowserSkeleton } from './SkillBrowser.Skeleton';

const SkillBrowserDesktop = lazy(
  () => import('./SkillBrowser.Desktop')
);

export interface Skill {
  id: string;
  name: string;
  category: string;
  description: string | null;
}

export interface SkillBrowserProps {
  skills: Skill[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

/**
 * v2 SkillBrowser — mobile-first with lazy-loaded desktop view.
 * Chip-based skill category filtering with card list.
 */
export function SkillBrowserV2(props: SkillBrowserProps) {
  const mode = useLayoutMode();

  if (props.loading) return <SkillBrowserSkeleton />;

  if (mode === 'mobile') return <SkillBrowserMobile {...props} />;

  return (
    <Suspense fallback={<SkillBrowserMobile {...props} />}>
      <SkillBrowserDesktop {...props} />
    </Suspense>
  );
}

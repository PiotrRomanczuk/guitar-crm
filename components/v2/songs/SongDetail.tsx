'use client';

import { lazy, Suspense } from 'react';
import { useLayoutMode } from '@/hooks/use-is-widescreen';
import { SongDetailMobile } from './SongDetail.Mobile';
import { SongDetailSkeleton } from './SongDetail.Skeleton';
import type { Song } from '@/components/songs/types';

const SongDetailDesktop = lazy(() => import('./SongDetail.Desktop'));

export interface SongDetailV2Props {
  songId: string;
  song: Song | null;
  loading: boolean;
  error: string | null;
  isTeacher: boolean;
  onDelete?: () => void;
}

export function SongDetailV2(props: SongDetailV2Props) {
  const mode = useLayoutMode();

  if (props.loading) return <SongDetailSkeleton />;

  if (mode === 'mobile') return <SongDetailMobile {...props} />;

  return (
    <Suspense fallback={<SongDetailMobile {...props} />}>
      <SongDetailDesktop {...props} />
    </Suspense>
  );
}

'use client';

import { useState } from 'react';
import { CheckCircle, Sun, Mic, Smartphone, AudioLines, Film, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { SyncedVideo } from './SyncedVideosTable';

type MicType = 'iphone' | 'external' | null;

interface QualityIconsProps {
  video: SyncedVideo;
  onVideoUpdated: () => void;
}

async function patchVideo(video: SyncedVideo, updates: Record<string, unknown>) {
  const res = await fetch('/api/admin/drive-videos', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ videoId: video.id, songId: video.song_id, updates }),
  });
  if (!res.ok) throw new Error('Failed to update');
}

function cycleMicType(current: MicType): MicType {
  if (current === null) return 'iphone';
  if (current === 'iphone') return 'external';
  return null;
}

function micLabel(type: MicType): string {
  if (type === 'iphone') return 'iPhone mic';
  if (type === 'external') return 'External mic';
  return 'No mic set';
}

export function QualityIcons({ video, onVideoUpdated }: QualityIconsProps) {
  const [toggling, setToggling] = useState<string | null>(null);

  const toggle = async (field: string, value: unknown) => {
    setToggling(field);
    try {
      await patchVideo(video, { [field]: value });
      onVideoUpdated();
    } catch {
      toast.error('Failed to update quality field');
    } finally {
      setToggling(null);
    }
  };

  const iconBtn = 'inline-flex items-center justify-center w-7 h-7 rounded-md transition-colors hover:bg-muted cursor-pointer';

  return (
    <div className="flex items-center gap-0.5">
      <button
        className={iconBtn}
        title={video.is_recording_correct ? 'Recording correct' : 'Recording has mistakes'}
        onClick={() => toggle('is_recording_correct', !video.is_recording_correct)}
        disabled={toggling === 'is_recording_correct'}
      >
        {toggling === 'is_recording_correct' ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
        ) : (
          <CheckCircle className={`w-3.5 h-3.5 ${video.is_recording_correct ? 'text-green-500' : 'text-muted-foreground/40'}`} />
        )}
      </button>

      <button
        className={iconBtn}
        title={video.is_well_lit ? 'Well lit' : 'Poorly lit'}
        onClick={() => toggle('is_well_lit', !video.is_well_lit)}
        disabled={toggling === 'is_well_lit'}
      >
        {toggling === 'is_well_lit' ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
        ) : (
          <Sun className={`w-3.5 h-3.5 ${video.is_well_lit ? 'text-yellow-500' : 'text-muted-foreground/40'}`} />
        )}
      </button>

      <button
        className={iconBtn}
        title={micLabel(video.mic_type)}
        onClick={() => toggle('mic_type', cycleMicType(video.mic_type))}
        disabled={toggling === 'mic_type'}
      >
        {toggling === 'mic_type' ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
        ) : video.mic_type === 'external' ? (
          <Mic className="w-3.5 h-3.5 text-orange-500" />
        ) : video.mic_type === 'iphone' ? (
          <Smartphone className="w-3.5 h-3.5 text-orange-400" />
        ) : (
          <Mic className="w-3.5 h-3.5 text-muted-foreground/40" />
        )}
      </button>

      <button
        className={iconBtn}
        title={video.is_audio_mixed ? 'Audio mixed' : 'Audio not mixed'}
        onClick={() => toggle('is_audio_mixed', !video.is_audio_mixed)}
        disabled={toggling === 'is_audio_mixed'}
      >
        {toggling === 'is_audio_mixed' ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
        ) : (
          <AudioLines className={`w-3.5 h-3.5 ${video.is_audio_mixed ? 'text-blue-500' : 'text-muted-foreground/40'}`} />
        )}
      </button>

      <button
        className={iconBtn}
        title={video.is_video_edited ? 'Video edited' : 'Video not edited'}
        onClick={() => toggle('is_video_edited', !video.is_video_edited)}
        disabled={toggling === 'is_video_edited'}
      >
        {toggling === 'is_video_edited' ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
        ) : (
          <Film className={`w-3.5 h-3.5 ${video.is_video_edited ? 'text-purple-500' : 'text-muted-foreground/40'}`} />
        )}
      </button>
    </div>
  );
}

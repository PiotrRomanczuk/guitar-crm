'use client';

import { Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Song } from '@/types/Song';

interface Props {
  song: Song;
  updatingStatus: boolean;
  onStatusChange: (status: string) => void;
}

export function StudentSongDetailHeader({ song, updatingStatus, onStatusChange }: Props) {
  return (
    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">{song.title}</h1>
        <p className="text-xl text-muted-foreground">{song.author}</p>
      </div>

      <div className="flex flex-col gap-4 md:items-end">
        <div className="space-y-2 min-w-48">
          <label className="text-sm font-medium text-muted-foreground">Learning Progress</label>
          <Select
            value={song.status || 'to_learn'}
            onValueChange={onStatusChange}
            disabled={updatingStatus}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="to_learn">To Learn</SelectItem>
              <SelectItem value="learning">Learning</SelectItem>
              <SelectItem value="practicing">Practicing</SelectItem>
              <SelectItem value="improving">Improving</SelectItem>
              <SelectItem value="mastered">Mastered</SelectItem>
            </SelectContent>
          </Select>
          {updatingStatus && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="w-3 h-3 animate-spin" />
              Updating...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

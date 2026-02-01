'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, User, Music2 } from 'lucide-react';
import { format } from 'date-fns';

interface SongStatusHistoryRecord {
  id: string;
  previous_status: string | null;
  new_status: string;
  changed_at: string;
  notes?: string;
  student?: {
    full_name: string | null;
    email: string;
  };
  song?: {
    title: string;
    author: string;
  };
}

interface SongStatusHistoryProps {
  songId?: string;
  studentId?: string;
  title?: string;
}

const statusColors: Record<string, string> = {
  to_learn: 'bg-muted text-muted-foreground border-border',
  learning: 'bg-primary/10 text-primary border-primary/20',
  learned: 'bg-success/10 text-success border-success/20',
  mastered: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
};

const statusLabels: Record<string, string> = {
  to_learn: 'To Learn',
  learning: 'Learning',
  learned: 'Learned',
  mastered: 'Mastered',
};

export function SongStatusHistory({ songId, studentId, title }: SongStatusHistoryProps) {
  const [history, setHistory] = useState<SongStatusHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = async () => {
    try {
      const supabase = createClient();

      let query = supabase
        .from('song_status_history')
        .select(
          `
          *,
          student:profiles!song_status_history_student_id_fkey(full_name, email),
          song:songs(title, author)
        `
        )
        .order('changed_at', { ascending: false });

      if (songId) {
        query = query.eq('song_id', songId);
      }

      if (studentId) {
        query = query.eq('student_id', studentId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Song status history query error:', error);
        throw error;
      }

      setHistory(data || []);
    } catch (err) {
      console.error('Error loading song status history:', {
        error: err,
        message: err instanceof Error ? err.message : 'Unknown error',
        songId,
        studentId,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [songId, studentId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title || 'Song Status History'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title || 'Song Status History'}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No status changes recorded
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Music2 className="h-5 w-5" />
          {title || 'Song Status History'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-100 pr-4">
          <div className="space-y-4">
            {history.map((record, idx) => (
              <div key={record.id} className="relative">
                {/* Timeline line */}
                {idx !== history.length - 1 && (
                  <div className="absolute left-4 top-8 bottom-0 w-px bg-border" />
                )}

                <div className="flex gap-4">
                  {/* Timeline dot */}
                  <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 border-2 border-primary">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-2 pb-4">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        {record.previous_status && (
                          <>
                            <Badge
                              variant="outline"
                              className={
                                statusColors[record.previous_status] || statusColors.to_learn
                              }
                            >
                              {statusLabels[record.previous_status] || record.previous_status}
                            </Badge>
                            <span className="text-muted-foreground">→</span>
                          </>
                        )}
                        <Badge
                          variant="outline"
                          className={statusColors[record.new_status] || statusColors.to_learn}
                        >
                          {statusLabels[record.new_status] || record.new_status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {format(new Date(record.changed_at), 'PPp')}
                      </div>
                    </div>

                    {!studentId && record.student && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-3 w-3" />
                        {record.student.full_name || record.student.email}
                      </div>
                    )}

                    {!songId && record.song && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Music2 className="h-3 w-3" />
                        {record.song.title} - {record.song.author}
                      </div>
                    )}

                    {record.notes && (
                      <p className="text-sm text-muted-foreground italic rounded-lg bg-muted/50 p-2">
                        {record.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

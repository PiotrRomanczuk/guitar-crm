'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Music, Search, Plus, Settings, Keyboard, ChevronRight, CalendarPlus, Loader2 } from 'lucide-react';
import type { StudentRepertoireWithSong } from '@/types/StudentRepertoire';
import { AddSongToRepertoireDialog } from './AddSongToRepertoireDialog';
import { EditSongConfigDialog } from './EditSongConfigDialog';
import { addSongToNextLessonAction } from '@/app/actions/repertoire';
import { toast } from 'sonner';

interface UserRepertoireTabProps {
  userId: string;
  repertoire: StudentRepertoireWithSong[];
}

const STATUS_COLORS: Record<string, string> = {
  mastered: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  with_author: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  remembered: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  started: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  to_learn: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

const PRIORITY_ORDER: Record<string, number> = { high: 0, normal: 1, low: 2, archived: 3 };

export default function UserRepertoireTab({ userId, repertoire }: UserRepertoireTabProps) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [groupBy, setGroupBy] = useState<string>('priority');
  const [editingItem, setEditingItem] = useState<StudentRepertoireWithSong | null>(null);

  const filtered = repertoire.filter((item) => {
    const matchesSearch =
      !search ||
      item.song.title.toLowerCase().includes(search.toLowerCase()) ||
      (item.song.author ?? '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || item.current_status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const grouped = groupItems(filtered, groupBy);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search songs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="to_learn">To Learn</SelectItem>
              <SelectItem value="started">Started</SelectItem>
              <SelectItem value="remembered">Remembered</SelectItem>
              <SelectItem value="with_author">With Author</SelectItem>
              <SelectItem value="mastered">Mastered</SelectItem>
            </SelectContent>
          </Select>
          <Select value={groupBy} onValueChange={setGroupBy}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Group by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="status">Status</SelectItem>
              <SelectItem value="none">No Grouping</SelectItem>
            </SelectContent>
          </Select>
          <AddSongToRepertoireDialog studentId={userId}>
            <Button className="gap-1">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Song</span>
            </Button>
          </AddSongToRepertoireDialog>
        </div>
      </div>

      {/* Song Groups */}
      {grouped.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Music className="h-8 w-8 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-foreground font-medium">No songs in repertoire</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add songs to start tracking this student&apos;s progress.
            </p>
            <AddSongToRepertoireDialog studentId={userId}>
              <Button variant="outline" className="mt-4 gap-1">
                <Plus className="h-4 w-4" />
                Add First Song
              </Button>
            </AddSongToRepertoireDialog>
          </CardContent>
        </Card>
      ) : (
        grouped.map((group) => (
          <div key={group.label} className="space-y-2">
            {group.label !== 'ungrouped' && (
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                {group.label}
                <span className="text-xs font-normal">({group.items.length})</span>
              </h3>
            )}
            <div className="space-y-1">
              {group.items.map((item) => (
                <RepertoireCard
                  key={item.id}
                  item={item}
                  studentId={userId}
                  onEditConfig={() => setEditingItem(item)}
                />
              ))}
            </div>
          </div>
        ))
      )}

      {editingItem && (
        <EditSongConfigDialog
          item={editingItem}
          open={!!editingItem}
          onOpenChange={(open) => !open && setEditingItem(null)}
        />
      )}
    </div>
  );
}

function AddToNextLessonButton({ studentId, songId, songTitle }: { studentId: string; songId: string; songTitle: string }) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      const result = await addSongToNextLessonAction(studentId, songId);

      if ('error' in result) {
        toast.error(result.error);
      } else if ('noLesson' in result) {
        toast.info(`No upcoming lesson scheduled for this student`);
      } else if ('alreadyInLesson' in result) {
        const date = new Date(result.scheduledAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        toast.info(`"${songTitle}" is already in the next lesson (${date})`);
      } else {
        const date = new Date(result.scheduledAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        toast.success(`"${songTitle}" added to lesson on ${date}`);
      }
    });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8"
      onClick={handleClick}
      disabled={isPending}
      title="Add to next lesson"
    >
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarPlus className="h-4 w-4" />}
    </Button>
  );
}

function RepertoireCard({
  item,
  studentId,
  onEditConfig,
}: {
  item: StudentRepertoireWithSong;
  studentId: string;
  onEditConfig: () => void;
}) {
  const hasOverrides = item.preferred_key || item.capo_fret !== null || item.custom_strumming;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shrink-0 mt-0.5">
              <Music className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-semibold text-sm truncate">{item.song.title}</h4>
                <Badge className={`text-[10px] ${STATUS_COLORS[item.current_status] || ''}`}>
                  {item.current_status.replace('_', ' ')}
                </Badge>
                {item.priority === 'high' && (
                  <Badge variant="outline" className="text-[10px] border-orange-300 text-orange-600 dark:text-orange-400">
                    High Priority
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{item.song.author}</p>

              {/* Student-specific config indicators */}
              {hasOverrides && (
                <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                  {item.preferred_key && (
                    <span className="flex items-center gap-0.5 font-mono bg-muted/50 px-1.5 rounded">
                      <Keyboard className="h-3 w-3" />
                      {item.preferred_key}
                      {item.song.key && item.preferred_key !== item.song.key && (
                        <span className="text-muted-foreground/60 ml-0.5">(song: {item.song.key})</span>
                      )}
                    </span>
                  )}
                  {item.capo_fret !== null && item.capo_fret > 0 && (
                    <span className="bg-muted/50 px-1.5 rounded">Capo {item.capo_fret}</span>
                  )}
                </div>
              )}

              {item.teacher_notes && (
                <p className="text-xs text-muted-foreground mt-1.5 italic line-clamp-1">
                  {item.teacher_notes}
                </p>
              )}

              {item.last_practiced_at && (
                <p className="text-[10px] text-muted-foreground/70 mt-1">
                  Last practiced:{' '}
                  {new Date(item.last_practiced_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <AddToNextLessonButton studentId={studentId} songId={item.song_id} songTitle={item.song.title} />
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEditConfig} title="Edit configuration">
              <Settings className="h-4 w-4" />
            </Button>
            <ChevronRight className="h-4 w-4 text-muted-foreground/30" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function groupItems(
  items: StudentRepertoireWithSong[],
  groupBy: string
): { label: string; items: StudentRepertoireWithSong[] }[] {
  if (groupBy === 'none') {
    return [{ label: 'ungrouped', items }];
  }

  const groups = new Map<string, StudentRepertoireWithSong[]>();

  for (const item of items) {
    const key = groupBy === 'priority' ? item.priority : item.current_status;
    const label = key.replace('_', ' ');
    const capitalizedLabel = label.charAt(0).toUpperCase() + label.slice(1);
    if (!groups.has(capitalizedLabel)) {
      groups.set(capitalizedLabel, []);
    }
    groups.get(capitalizedLabel)!.push(item);
  }

  // Sort groups
  const entries = Array.from(groups.entries());
  if (groupBy === 'priority') {
    entries.sort((a, b) => {
      const aOrder = PRIORITY_ORDER[a[1][0]?.priority] ?? 99;
      const bOrder = PRIORITY_ORDER[b[1][0]?.priority] ?? 99;
      return aOrder - bOrder;
    });
  }

  return entries.map(([label, groupItems]) => ({ label, items: groupItems }));
}

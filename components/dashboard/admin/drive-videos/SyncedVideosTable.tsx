'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Pencil, Trash2, Check, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { QualityIcons } from './QualityIcons';

interface SongInfo {
  id: string;
  title: string;
  author: string;
}

export interface SyncedVideo {
  id: string;
  song_id: string;
  title: string;
  filename: string;
  file_size_bytes: number | null;
  mime_type: string;
  created_at: string;
  songs: SongInfo;
  is_recording_correct: boolean;
  is_well_lit: boolean;
  mic_type: 'iphone' | 'external' | null;
  is_audio_mixed: boolean;
  is_video_edited: boolean;
}

interface SyncedVideosTableProps {
  videos: SyncedVideo[];
  onVideoUpdated: () => void;
  onVideoDeleted: () => void;
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return '--';
  const mb = bytes / (1024 * 1024);
  return mb < 1 ? `${(bytes / 1024).toFixed(0)} KB` : `${mb.toFixed(1)} MB`;
}

export function SyncedVideosTable({ videos, onVideoUpdated, onVideoDeleted }: SyncedVideosTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const sorted = [...videos].sort((a, b) => {
    const songA = a.songs?.title ?? '';
    const songB = b.songs?.title ?? '';
    return songA.localeCompare(songB);
  });

  const startEdit = (video: SyncedVideo) => {
    setEditingId(video.id);
    setEditTitle(video.title);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const saveTitle = async (video: SyncedVideo) => {
    if (editTitle.trim() === video.title) {
      cancelEdit();
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/drive-videos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId: video.id, songId: video.song_id, updates: { title: editTitle.trim() } }),
      });
      if (!res.ok) throw new Error('Failed to update');
      toast.success('Video title updated');
      cancelEdit();
      onVideoUpdated();
    } catch {
      toast.error('Failed to update video title');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (video: SyncedVideo) => {
    setDeletingId(video.id);
    try {
      const res = await fetch('/api/admin/drive-videos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId: video.id, songId: video.song_id }),
      });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Video deleted');
      onVideoDeleted();
    } catch {
      toast.error('Failed to delete video');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Song</TableHead>
              <TableHead>Video Title</TableHead>
              <TableHead>Filename</TableHead>
              <TableHead className="w-[80px]">Size</TableHead>
              <TableHead className="w-[200px]">Quality</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((video) => (
              <TableRow key={video.id} className="hover:bg-muted/50">
                <TableCell>
                  <div className="space-y-0.5">
                    <div className="font-medium text-sm line-clamp-1">{video.songs?.title}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1">{video.songs?.author}</div>
                  </div>
                </TableCell>
                <TableCell>
                  {editingId === video.id ? (
                    <div className="flex items-center gap-1">
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveTitle(video);
                          if (e.key === 'Escape') cancelEdit();
                        }}
                        className="h-7 text-sm"
                        autoFocus
                      />
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => saveTitle(video)} disabled={saving}>
                        {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={cancelEdit}>
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <span className="text-sm">{video.title || <span className="text-muted-foreground italic">No title</span>}</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className="text-xs text-muted-foreground font-mono line-clamp-1">{video.filename}</span>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-xs">{formatFileSize(video.file_size_bytes)}</Badge>
                </TableCell>
                <TableCell>
                  <QualityIcons video={video} onVideoUpdated={onVideoUpdated} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-1 justify-end">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => startEdit(video)} title="Edit title">
                      <Pencil className="w-3 h-3" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" title="Delete video">
                          {deletingId === video.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete video?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will remove &quot;{video.filename}&quot; from the database. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(video)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile card layout */}
      <div className="md:hidden space-y-3">
        {sorted.map((video) => (
          <div key={video.id} className="rounded-lg border border-border p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-0.5 min-w-0 flex-1">
                <div className="font-medium text-sm">{video.songs?.title}</div>
                <div className="text-xs text-muted-foreground">{video.songs?.author}</div>
              </div>
              <Badge variant="secondary" className="text-xs shrink-0">{formatFileSize(video.file_size_bytes)}</Badge>
            </div>
            <div className="text-xs text-muted-foreground font-mono truncate">{video.filename}</div>
            <QualityIcons video={video} onVideoUpdated={onVideoUpdated} />
            {editingId === video.id ? (
              <div className="flex items-center gap-1">
                <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="h-8 text-sm" autoFocus />
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => saveTitle(video)} disabled={saving}>
                  {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={cancelEdit}><X className="w-3 h-3" /></Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm">{video.title || <span className="text-muted-foreground italic">No title</span>}</span>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => startEdit(video)}><Pencil className="w-3 h-3" /></Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive"><Trash2 className="w-3 h-3" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete video?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will remove &quot;{video.filename}&quot; from the database. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(video)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Video, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { SongVideo } from '@/types/SongVideo';
import VideoCard from './VideoCard';
import VideoPlayer from './VideoPlayer';
import VideoUpload from './VideoUpload';

interface VideoGalleryProps {
  songId: string;
  isTeacher: boolean;
}

async function fetchVideos(songId: string): Promise<SongVideo[]> {
  const res = await fetch(`/api/song/${songId}/videos`);
  if (!res.ok) throw new Error('Failed to load videos');
  const data = await res.json();
  return data.videos;
}

async function deleteVideo(songId: string, videoId: string) {
  const res = await fetch(`/api/song/${songId}/videos/${videoId}`, { method: 'DELETE' });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to delete video');
  }
}

export default function VideoGallery({ songId, isTeacher }: VideoGalleryProps) {
  const queryClient = useQueryClient();
  const [activeVideo, setActiveVideo] = useState<SongVideo | null>(null);
  const [videoToDelete, setVideoToDelete] = useState<SongVideo | null>(null);

  const { data: videos = [], isLoading } = useQuery({
    queryKey: ['song-videos', songId],
    queryFn: () => fetchVideos(songId),
  });

  const deleteMutation = useMutation({
    mutationFn: (videoId: string) => deleteVideo(songId, videoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['song-videos', songId] });
      toast.success('Video deleted');
      setVideoToDelete(null);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to delete video');
    },
  });

  return (
    <>
      <Card className="bg-card border-border/50 shadow-sm">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Video className="w-5 h-5 text-primary" />
            Videos
            {videos.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                ({videos.length})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : videos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  isTeacher={isTeacher}
                  onPlay={setActiveVideo}
                  onDelete={setVideoToDelete}
                />
              ))}
            </div>
          ) : (
            <div className="py-8 text-center bg-muted/30 rounded-lg border border-dashed border-border">
              <Video className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">No videos yet</p>
              {isTeacher && (
                <p className="text-sm text-muted-foreground/70 mt-1">
                  Upload tutorial clips or demo recordings.
                </p>
              )}
            </div>
          )}

          {isTeacher && <VideoUpload songId={songId} />}
        </CardContent>
      </Card>

      {/* Video Player Modal */}
      <VideoPlayer
        video={activeVideo}
        songId={songId}
        onClose={() => setActiveVideo(null)}
      />

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!videoToDelete}
        onOpenChange={(open) => !open && setVideoToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Video</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{videoToDelete?.title || videoToDelete?.filename}&quot;
              from both the app and Google Drive. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => videoToDelete && deleteMutation.mutate(videoToDelete.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

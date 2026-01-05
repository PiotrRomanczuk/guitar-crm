'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Square, Timer, Music } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface Song {
  id: string;
  title: string;
  artist: string;
}

interface PracticeTimerCardProps {
  songs: Song[];
  className?: string;
}

export function PracticeTimerCard({ songs, className }: PracticeTimerCardProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0); // in seconds
  const [selectedSong, setSelectedSong] = useState<string>('general');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const supabase = createClient();

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start/Stop timer
  const toggleTimer = () => {
    if (isRunning) {
      // Stop timer
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsRunning(false);
    } else {
      // Start timer
      setIsRunning(true);
      intervalRef.current = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    }
  };

  // Reset timer
  const resetTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
    setTime(0);
    setSelectedSong('general');
    setNotes('');
  };

  // Save practice session
  const savePracticeSession = async () => {
    if (time === 0) {
      toast.error("No practice time recorded. Start the timer and practice before saving.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('practice_sessions')
        .insert({
          student_id: user.id,
          song_id: selectedSong === 'general' ? null : selectedSong,
          duration_minutes: Math.ceil(time / 60),
          notes: notes.trim() || null
        });

      if (error) throw error;

      toast.success(`Practice session saved! Recorded ${Math.ceil(time / 60)} minutes of practice.`);

      // Reset the timer after successful save
      resetTimer();
    } catch (error) {
      console.error('Error saving practice session:', error);
      toast.error("Failed to save session. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <Card className={cn("opacity-0 animate-fade-in", className)} style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Timer className="w-5 h-5 text-primary" />
          Practice Timer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Timer Display */}
        <div className="text-center">
          <div className="text-4xl font-mono font-bold text-primary mb-2">
            {formatTime(time)}
          </div>
          <div className="flex items-center justify-center gap-2">
            <Badge variant={isRunning ? "default" : "secondary"}>
              {isRunning ? "Recording" : "Stopped"}
            </Badge>
            {time > 0 && (
              <Badge variant="outline">
                {Math.ceil(time / 60)} min{Math.ceil(time / 60) !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </div>

        {/* Song Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Practice Song (Optional)
          </label>
          <Select value={selectedSong} onValueChange={setSelectedSong}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a song to practice">
                {selectedSong === 'general' ? (
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4" />
                    General Practice
                  </div>
                ) : selectedSong && (
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4" />
                    {songs.find(s => s.id === selectedSong)?.title}
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General Practice</SelectItem>
              {songs.map((song) => (
                <SelectItem key={song.id} value={song.id}>
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4" />
                    <span>{song.title} - {song.artist}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Timer Controls */}
        <div className="flex justify-center gap-3">
          <Button
            onClick={toggleTimer}
            variant={isRunning ? "secondary" : "default"}
            size="lg"
            className="flex items-center gap-2"
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Start
              </>
            )}
          </Button>
          
          <Button
            onClick={resetTimer}
            variant="outline"
            size="lg"
            disabled={time === 0}
            className="flex items-center gap-2"
          >
            <Square className="w-4 h-4" />
            Reset
          </Button>
        </div>

        {/* Notes */}
        {time > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Practice Notes (Optional)
            </label>
            <Textarea
              placeholder="What did you work on? Any challenges or breakthroughs?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>
        )}

        {/* Save Button */}
        {time > 0 && (
          <Button
            onClick={savePracticeSession}
            disabled={isSubmitting}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? "Saving..." : "Save Practice Session"}
          </Button>
        )}

        {/* Quick Goals */}
        <div className="border-t pt-4">
          <p className="text-sm font-medium mb-2">Today&apos;s Practice Goal</p>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setTime(15 * 60)}
              disabled={isRunning}
            >
              15 min
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setTime(30 * 60)}
              disabled={isRunning}
            >
              30 min
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setTime(45 * 60)}
              disabled={isRunning}
            >
              45 min
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
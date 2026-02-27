'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { SongOfTheWeekWithSong } from '@/types/SongOfTheWeek';
import { SongOfTheWeekSongDetails } from './SongOfTheWeek.SongDetails';
import { SongOfTheWeekAddButton } from './SongOfTheWeek.AddButton';
import { SongOfTheWeekAdminControls } from './SongOfTheWeek.AdminControls';
import { SongOfTheWeekPickerDialog } from './SongOfTheWeek.PickerDialog';
import { SongOfTheWeekEmptyState } from './SongOfTheWeek.EmptyState';

interface SongOfTheWeekCardProps {
  sotw: SongOfTheWeekWithSong | null;
  sotwInRepertoire?: boolean;
  isAdmin?: boolean;
  isStudent?: boolean;
}

export function SongOfTheWeekCard({
  sotw,
  sotwInRepertoire = false,
  isAdmin = false,
  isStudent = false,
}: SongOfTheWeekCardProps) {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <>
      <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-primary/10">
                <Star className="w-4 h-4 text-primary fill-primary" />
              </div>
              <h2 className="font-semibold text-base">Song of the Week</h2>
            </div>
            {isAdmin && sotw && (
              <SongOfTheWeekAdminControls
                sotwId={sotw.id}
                onChangeSong={() => setPickerOpen(true)}
              />
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {sotw ? (
            <div className="space-y-4">
              {/* Teacher message */}
              {sotw.teacher_message && (
                <blockquote className="border-l-2 border-primary/30 pl-3 text-sm text-muted-foreground italic">
                  {sotw.teacher_message}
                </blockquote>
              )}

              <SongOfTheWeekSongDetails song={sotw.song} />

              {/* Student add button */}
              {isStudent && (
                <SongOfTheWeekAddButton alreadyInRepertoire={sotwInRepertoire} />
              )}
            </div>
          ) : (
            <SongOfTheWeekEmptyState
              isAdmin={isAdmin}
              onSelectSong={() => setPickerOpen(true)}
            />
          )}
        </CardContent>
      </Card>

      {isAdmin && (
        <SongOfTheWeekPickerDialog
          isOpen={pickerOpen}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </>
  );
}

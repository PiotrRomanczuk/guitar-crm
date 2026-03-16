'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import useLessonForm from '@/components/lessons/hooks/useLessonForm';
import { useSongs } from '@/components/lessons/hooks/useSongs';
import { StepWizardForm, MobilePageShell, FullScreenSearchPicker } from '@/components/v2/primitives';
import { StudentStep, SongsStep, ScheduleStep, NotesStep } from './LessonForm.Steps';
import type { LessonFormData } from '@/components/lessons/hooks/useLessonForm';

interface LessonFormV2Props {
  initialData?: Partial<LessonFormData>;
  lessonId?: string;
}

export function LessonFormV2({ initialData, lessonId }: LessonFormV2Props) {
  const router = useRouter();
  const {
    formData,
    students,
    loading,
    error,
    validationErrors,
    handleChange,
    handleBlur,
    handleSongChange,
    handleSubmit,
  } = useLessonForm({ initialData, lessonId });

  const { songs } = useSongs();
  const [studentPickerOpen, setStudentPickerOpen] = useState(false);
  const [songPickerOpen, setSongPickerOpen] = useState(false);

  const selectedStudent = students.find((s) => s.id === formData.student_id);
  const selectedSongs = songs.filter((s) =>
    formData.song_ids?.includes(s.id)
  );

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const result = await handleSubmit();
      if (result?.success) {
        toast.success(lessonId ? 'Lesson updated' : 'Lesson created');
        router.push('/dashboard/lessons?created=true');
      }
    },
    [handleSubmit, router, lessonId]
  );

  const handleStudentSelect = useCallback(
    (student: { id: string; full_name: string | null; email: string }) => {
      const event = {
        target: { name: 'student_id', value: student.id },
      } as React.ChangeEvent<HTMLInputElement>;
      handleChange(event);
    },
    [handleChange]
  );

  const toggleSong = useCallback(
    (song: { id: string; title: string; author: string }) => {
      const current = formData.song_ids ?? [];
      const newIds = current.includes(song.id)
        ? current.filter((id) => id !== song.id)
        : [...current, song.id];
      handleSongChange(newIds);
    },
    [formData.song_ids, handleSongChange]
  );

  if (loading) {
    return (
      <MobilePageShell title={lessonId ? 'Edit Lesson' : 'New Lesson'}>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </MobilePageShell>
    );
  }

  const steps = [
    {
      label: 'Student',
      requiredFields: ['student_id'],
      content: (
        <StudentStep
          selectedStudent={selectedStudent}
          error={validationErrors.student_id}
          onOpen={() => setStudentPickerOpen(true)}
        />
      ),
    },
    {
      label: 'Songs',
      content: (
        <SongsStep
          selectedSongs={selectedSongs}
          onOpen={() => setSongPickerOpen(true)}
        />
      ),
    },
    {
      label: 'Schedule',
      requiredFields: ['scheduled_at'],
      content: (
        <ScheduleStep
          value={formData.scheduled_at}
          error={validationErrors.scheduled_at}
          onChange={handleChange}
          onBlur={() => handleBlur('scheduled_at')}
        />
      ),
    },
    {
      label: 'Notes',
      content: (
        <NotesStep
          title={formData.title ?? ''}
          notes={formData.notes ?? ''}
          onChange={handleChange}
        />
      ),
    },
  ];

  return (
    <MobilePageShell
      title={lessonId ? 'Edit Lesson' : 'New Lesson'}
      subtitle={`Step wizard${error ? ` — ${error}` : ''}`}
    >
      <form onSubmit={onSubmit}>
        <StepWizardForm
          steps={steps}
          formData={formData as unknown as Record<string, unknown>}
          errors={validationErrors}
          submitLabel={lessonId ? 'Update Lesson' : 'Create Lesson'}
        />
      </form>

      <FullScreenSearchPicker
        open={studentPickerOpen}
        onOpenChange={setStudentPickerOpen}
        placeholder="Search students..."
        items={students}
        filterFn={(s, q) => {
          const lower = q.toLowerCase();
          return (
            (s.full_name?.toLowerCase().includes(lower) ?? false) ||
            s.email.toLowerCase().includes(lower)
          );
        }}
        renderItem={(s) => (
          <div>
            <p className="text-sm font-medium">{s.full_name || s.email}</p>
            {s.full_name && (
              <p className="text-xs text-muted-foreground">{s.email}</p>
            )}
          </div>
        )}
        onSelect={handleStudentSelect}
        keyExtractor={(s) => s.id}
        emptyMessage="No students found"
        title="Select Student"
      />

      <FullScreenSearchPicker
        open={songPickerOpen}
        onOpenChange={setSongPickerOpen}
        placeholder="Search songs..."
        items={songs}
        filterFn={(s, q) => {
          const lower = q.toLowerCase();
          return (
            s.title.toLowerCase().includes(lower) ||
            s.author.toLowerCase().includes(lower)
          );
        }}
        renderItem={(s) => (
          <div className="flex items-center justify-between w-full">
            <div>
              <p className="text-sm font-medium">{s.title}</p>
              <p className="text-xs text-muted-foreground">{s.author}</p>
            </div>
            {formData.song_ids?.includes(s.id) && (
              <span className="text-primary text-xs font-medium">Selected</span>
            )}
          </div>
        )}
        onSelect={toggleSong}
        keyExtractor={(s) => s.id}
        emptyMessage="No songs found"
        title="Select Songs"
      />
    </MobilePageShell>
  );
}

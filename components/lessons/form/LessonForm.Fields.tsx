const inputClass =
  'w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm border border-gray-300 bg-white rounded-lg shadow-sm transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white hover:border-gray-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:shadow-lg dark:hover:border-gray-500';

const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2';

import { LessonNotesAI } from './LessonNotesAI';

interface Props {
  formData: {
    title?: string;
    scheduled_at: string;
    notes?: string;
    status?: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  };
  validationErrors: { [key: string]: string };
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  studentName?: string;
  selectedSongs?: Array<{ title: string }>;
  previousNotes?: string;
}

export function LessonFormFields({
  formData,
  validationErrors,
  handleChange,
  studentName,
  selectedSongs = [],
  previousNotes,
}: Props) {
  const handleNotesGenerated = (generatedNotes: string) => {
    // Create a synthetic event to update the notes field
    const syntheticEvent = {
      target: {
        name: 'notes',
        value: generatedNotes,
      },
    } as React.ChangeEvent<HTMLTextAreaElement>;

    handleChange(syntheticEvent);
  };

  return (
    <>
      <div>
        <label htmlFor="title" className={labelClass}>
          Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title || ''}
          onChange={handleChange}
          placeholder="Lesson Title"
          data-testid="lesson-title"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="scheduled_at" className={labelClass}>
          Scheduled Date & Time *
        </label>
        <input
          type="datetime-local"
          id="scheduled_at"
          name="scheduled_at"
          value={formData.scheduled_at}
          onChange={handleChange}
          required
          data-testid="lesson-scheduled-at"
          className={inputClass}
        />
        {validationErrors.scheduled_at && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {validationErrors.scheduled_at}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="status" className={labelClass}>
          Status
        </label>
        <select
          id="status"
          name="status"
          value={formData.status || 'SCHEDULED'}
          onChange={handleChange}
          className={inputClass}
          data-testid="lesson-status"
        >
          <option value="SCHEDULED">Scheduled</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <div>
        <div className="flex justify-between items-center">
          <label htmlFor="notes" className={labelClass}>
            Notes
          </label>
          {studentName && selectedSongs.length > 0 && (
            <LessonNotesAI
              studentName={studentName}
              songsCovered={selectedSongs.map((song) => song.title)}
              lessonTopic={formData.title || 'Guitar Lesson'}
              onNotesGenerated={handleNotesGenerated}
              disabled={!formData.title}
            />
          )}
        </div>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes || ''}
          onChange={handleChange}
          rows={4}
          placeholder="Add any notes about this lesson..."
          data-testid="lesson-notes"
          className={inputClass}
        />
      </div>
    </>
  );
}

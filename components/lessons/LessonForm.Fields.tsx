const inputClass =
  'w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm border border-gray-300 bg-white rounded-lg shadow-sm transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white hover:border-gray-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:shadow-lg dark:hover:border-gray-500';

const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2';

interface Props {
  formData: {
    scheduled_at: string;
    notes?: string;
  };
  validationErrors: { [key: string]: string };
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export function LessonFormFields({ formData, validationErrors, handleChange }: Props) {
  return (
    <>
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
        <label htmlFor="notes" className={labelClass}>
          Notes
        </label>
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

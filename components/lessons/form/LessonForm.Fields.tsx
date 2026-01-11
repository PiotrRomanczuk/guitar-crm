import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

  const handleStatusChange = (newValue: string) => {
    const syntheticEvent = {
      target: { name: 'status', value: newValue },
    } as React.ChangeEvent<HTMLSelectElement>;
    handleChange(syntheticEvent);
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="space-y-2">
        <Label htmlFor="title">Lesson Title (Optional)</Label>
        <Input
          type="text"
          id="title"
          name="title"
          value={formData.title || ''}
          onChange={handleChange}
          placeholder="e.g., Introduction to Strumming Patterns"
          data-testid="lesson-title"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="scheduled_at">
          Scheduled Date & Time <span className="text-destructive">*</span>
        </Label>
        <Input
          type="datetime-local"
          id="scheduled_at"
          name="scheduled_at"
          value={formData.scheduled_at}
          onChange={handleChange}
          required
          data-testid="lesson-scheduled-at"
        />
        {validationErrors.scheduled_at && (
          <p className="text-sm text-destructive">{validationErrors.scheduled_at}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select value={formData.status || 'SCHEDULED'} onValueChange={handleStatusChange}>
          <SelectTrigger id="status" data-testid="lesson-status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SCHEDULED">Scheduled</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <Label htmlFor="notes">Lesson Notes (Optional)</Label>
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
        <Textarea
          id="notes"
          name="notes"
          value={formData.notes || ''}
          onChange={handleChange}
          rows={5}
          placeholder="Add notes about what was covered, homework assigned, student progress, etc."
          data-testid="lesson-notes"
          className="resize-none"
        />
      </div>
    </div>
  );
}

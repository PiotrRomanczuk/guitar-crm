import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FormData {
  title: string;
  description: string;
  due_date: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';
  student_id: string;
}

interface Student {
  id: string;
  full_name: string | null;
  email: string | null;
}

interface AssignmentFormFieldsProps {
  formData: FormData;
  onChange: (name: string, value: string) => void;
  students?: Student[];
}

export function AssignmentFormFields({
  formData,
  onChange,
  students = [],
}: AssignmentFormFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="title">
          Title <span className="text-red-600">*</span>
        </Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={(e) => onChange('title', e.target.value)}
          required
          placeholder="Assignment title"
          data-testid="field-title"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={(e) => onChange('description', e.target.value)}
          placeholder="Assignment description"
          data-testid="field-description"
        />
      </div>

      {students.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="student">Student</Label>
          <Select
            value={formData.student_id}
            onValueChange={(value) => onChange('student_id', value)}
          >
            <SelectTrigger id="student" data-testid="student-select">
              <SelectValue placeholder="Select a student" />
            </SelectTrigger>
            <SelectContent>
              {students.map((student) => (
                <SelectItem key={student.id} value={student.id}>
                  {student.full_name || student.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="due_date">Due Date</Label>
        <Input
          id="due_date"
          name="due_date"
          type="date"
          value={formData.due_date ? formData.due_date.split('T')[0] : ''}
          onChange={(e) => onChange('due_date', e.target.value)}
          data-testid="field-due-date"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select value={formData.status} onValueChange={(value) => onChange('status', value)}>
          <SelectTrigger id="status" data-testid="field-status">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="not_started">Not Started</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
}

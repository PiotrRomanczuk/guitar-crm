'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Student {
  id: string;
  full_name: string | null;
  email: string | null;
}

interface AssignmentFormFieldsProps {
  formData: {
    title: string;
    description: string;
    due_date: string;
    status: string;
    student_id: string;
    teacher_id: string;
  };
  onChange: (name: string, value: string) => void;
  students: Student[];
}

export function AssignmentFormFields({
  formData,
  onChange,
  students,
}: AssignmentFormFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={(e) => onChange('title', e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="student_id">Student *</Label>
        <Select value={formData.student_id} onValueChange={(value) => onChange('student_id', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select student" />
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

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={(e) => onChange('description', e.target.value)}
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="due_date">Due Date</Label>
        <Input
          id="due_date"
          name="due_date"
          type="datetime-local"
          value={formData.due_date}
          onChange={(e) => onChange('due_date', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select value={formData.status} onValueChange={(value) => onChange('status', value)}>
          <SelectTrigger>
            <SelectValue />
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

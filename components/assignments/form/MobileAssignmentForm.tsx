'use client';

import { useMemo } from 'react';
import StepWizardForm from '@/components/shared/StepWizardForm';
import { FormFieldText, FormFieldSelect, FormFieldTextarea } from '@/components/shared/FormField';
import { AssignmentAI } from './AssignmentAI';

interface Student {
  id: string;
  full_name: string | null;
  email: string | null;
}

interface FormData {
  title: string;
  description: string;
  due_date: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';
  student_id: string;
}

interface MobileAssignmentFormProps {
  formData: FormData;
  errors: Record<string, string | undefined>;
  students: Student[];
  onChange: (name: string, value: string) => void;
  onBlur: (field: keyof FormData) => void;
}

const STATUS_OPTIONS = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function MobileAssignmentForm({
  formData,
  errors,
  students,
  onChange,
  onBlur,
}: MobileAssignmentFormProps) {
  const studentOptions = students.map((s) => ({
    value: s.id,
    label: s.full_name || s.email || '',
    description: s.full_name ? (s.email ?? undefined) : undefined,
  }));

  const selectedStudent = students.find((s) => s.id === formData.student_id);

  const duration = useMemo(() => {
    if (!formData.due_date) return '1 week';
    const diffDays = Math.ceil(
      (new Date(formData.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return diffDays > 0 ? `${diffDays} days` : '1 week';
  }, [formData.due_date]);

  const steps = [
    {
      label: 'Student',
      requiredFields: students.length > 0 ? ['student_id'] : [],
      content: (
        <div className="space-y-4">
          {students.length > 0 && (
            <FormFieldSelect
              label="Student"
              id="student_id"
              value={formData.student_id}
              error={errors.student_id}
              onChange={(v) => {
                onChange('student_id', v);
                onBlur('student_id');
              }}
              options={studentOptions}
              required
            />
          )}

          <FormFieldSelect
            label="Status"
            id="status"
            value={formData.status}
            error={errors.status}
            onChange={(v) => {
              onChange('status', v);
              onBlur('status');
            }}
            options={STATUS_OPTIONS}
          />
        </div>
      ),
    },
    {
      label: 'Content',
      requiredFields: ['title'],
      content: (
        <div className="space-y-4">
          <FormFieldText
            label="Title"
            id="title"
            value={formData.title}
            error={errors.title}
            onChange={(v) => onChange('title', v)}
            onBlur={() => onBlur('title')}
            placeholder="Assignment title"
            required
          />

          <FormFieldTextarea
            label="Description"
            id="description"
            value={formData.description}
            error={errors.description}
            onChange={(v) => onChange('description', v)}
            onBlur={() => onBlur('description')}
            placeholder="Assignment description"
            rows={6}
          >
            {selectedStudent && formData.title && (
              <AssignmentAI
                studentName={selectedStudent.full_name || selectedStudent.email || ''}
                studentId={selectedStudent.id}
                studentLevel="intermediate"
                recentSongs={['Wonderwall', 'Hotel California']}
                focusArea={formData.title}
                duration={duration}
                lessonTopic="Practice assignment"
                onAssignmentGenerated={(text) => onChange('description', text)}
                disabled={!formData.title}
              />
            )}
          </FormFieldTextarea>
        </div>
      ),
    },
    {
      label: 'Schedule',
      content: (
        <div className="space-y-4">
          <FormFieldText
            label="Due Date"
            id="due_date"
            type="date"
            value={formData.due_date ? formData.due_date.split('T')[0] : ''}
            error={errors.due_date}
            onChange={(v) => onChange('due_date', v)}
            onBlur={() => onBlur('due_date')}
          />
        </div>
      ),
    },
  ];

  return (
    <StepWizardForm
      steps={steps}
      formData={formData as unknown as Record<string, unknown>}
      errors={errors as Record<string, string>}
      submitLabel="Save Assignment"
    />
  );
}

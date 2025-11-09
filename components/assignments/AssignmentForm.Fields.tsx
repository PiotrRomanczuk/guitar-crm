interface FormData {
  title: string;
  description: string;
  due_date: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'PENDING_REVIEW' | 'COMPLETED' | 'CANCELLED' | 'BLOCKED';
  user_id: string;
}

interface AssignmentFormFieldsProps {
  formData: FormData;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
}

export function AssignmentFormFields({ formData, onChange }: AssignmentFormFieldsProps) {
  return (
    <>
      <FormField
        label="Title"
        name="title"
        type="text"
        value={formData.title}
        onChange={onChange}
        required
        placeholder="Assignment title"
        testId="field-title"
      />

      <FormField
        label="Description"
        name="description"
        type="textarea"
        value={formData.description}
        onChange={onChange}
        placeholder="Assignment description"
        testId="field-description"
      />

      <FormField
        label="Due Date"
        name="due_date"
        type="date"
        value={formData.due_date ? formData.due_date.split('T')[0] : ''}
        onChange={onChange}
        testId="field-due-date"
      />

      <FormField
        label="Priority"
        name="priority"
        type="select"
        value={formData.priority}
        onChange={onChange}
        options={[
          { value: 'LOW', label: 'Low' },
          { value: 'MEDIUM', label: 'Medium' },
          { value: 'HIGH', label: 'High' },
          { value: 'URGENT', label: 'Urgent' },
        ]}
        testId="field-priority"
      />

      <FormField
        label="Status"
        name="status"
        type="select"
        value={formData.status}
        onChange={onChange}
        options={[
          { value: 'OPEN', label: 'Open' },
          { value: 'IN_PROGRESS', label: 'In Progress' },
          { value: 'PENDING_REVIEW', label: 'Pending Review' },
          { value: 'COMPLETED', label: 'Completed' },
          { value: 'CANCELLED', label: 'Cancelled' },
          { value: 'BLOCKED', label: 'Blocked' },
        ]}
        testId="field-status"
      />
    </>
  );
}

interface FormFieldProps {
  label: string;
  name: string;
  type: 'text' | 'textarea' | 'date' | 'select';
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  required?: boolean;
  placeholder?: string;
  testId?: string;
  options?: { value: string; label: string }[];
}

function FormField({
  label,
  name,
  type,
  value,
  onChange,
  required,
  placeholder,
  testId,
  options,
}: FormFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
        {label}
        {required && <span className="text-red-600">*</span>}
      </label>

      {type === 'textarea' ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full px-4 py-2 border border-gray-300 bg-white rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm resize-vertical"
          rows={4}
          data-testid={testId}
        />
      ) : type === 'select' ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          className="w-full px-4 py-2 border border-gray-300 bg-white rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
          data-testid={testId}
        >
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className="w-full px-4 py-2 border border-gray-300 bg-white rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
          data-testid={testId}
        />
      )}
    </div>
  );
}

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AssignmentForm from './AssignmentForm';
import { useRouter } from 'next/navigation';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock child components
jest.mock('./AssignmentForm.Fields', () => ({
  AssignmentFormFields: ({ formData, onChange }: { formData: { title: string }; onChange: (field: string, value: string) => void }) => (
    <div data-testid="assignment-form-fields">
      <input
        data-testid="input-title"
        value={formData.title}
        onChange={(e) => onChange('title', e.target.value)}
      />
    </div>
  ),
}));

jest.mock('./AssignmentForm.Actions', () => ({
  AssignmentFormActions: ({ loading }: { loading: boolean }) => (
    <button type="submit" disabled={loading}>
      {loading ? 'Saving...' : 'Save'}
    </button>
  ),
}));

describe('AssignmentForm', () => {
  const mockRouter = {
    push: jest.fn(),
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    global.fetch = jest.fn();
  });

  it('renders in create mode', () => {
    render(<AssignmentForm mode="create" />);
    expect(screen.getByText('Create Assignment')).toBeInTheDocument();
    expect(screen.getByTestId('assignment-form-fields')).toBeInTheDocument();
  });

  it('renders in edit mode with initial data', () => {
    const initialData = {
      id: '123',
      title: 'Test Assignment',
      description: 'Desc',
      due_date: '2023-01-01',
      status: 'not_started' as const,
      teacher_id: 't1',
      student_id: 's1',
    };

    render(<AssignmentForm mode="edit" initialData={initialData} />);
    expect(screen.getByText('Edit Assignment')).toBeInTheDocument();
    expect(screen.getByTestId('input-title')).toHaveValue('Test Assignment');
  });

  it('handles successful submission (create)', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'new-id' }),
    });

    render(<AssignmentForm mode="create" />);
    
    fireEvent.change(screen.getByTestId('input-title'), { target: { value: 'New Assignment' } });
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/assignments', expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('New Assignment'),
      }));
      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard/assignments/new-id');
    });
  });

  it('handles successful submission (edit)', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ id: '123' }),
    });

    const initialData = {
      id: '123',
      title: 'Old Title',
      description: null,
      due_date: null,
      status: 'not_started' as const,
      teacher_id: 't1',
      student_id: 's1',
    };

    render(<AssignmentForm mode="edit" initialData={initialData} />);
    
    fireEvent.change(screen.getByTestId('input-title'), { target: { value: 'Updated Title' } });
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/assignments/123', expect.objectContaining({
        method: 'PUT',
        body: expect.stringContaining('Updated Title'),
      }));
      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard/assignments/123');
    });
  });

  it('handles submission error', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Server error' }),
    });

    render(<AssignmentForm mode="create" />);
    
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(screen.getByText('Server error')).toBeInTheDocument();
      expect(mockRouter.push).not.toHaveBeenCalled();
    });
  });
});

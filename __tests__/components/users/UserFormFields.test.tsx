import { render, screen, fireEvent } from '@testing-library/react';
import { UserFormFields } from '@/components/users';
import '@testing-library/jest-dom';

describe('UserFormFields', () => {
  const mockFormData = {
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    isAdmin: false,
    isTeacher: false,
    isStudent: true,
    isActive: true,
    isShadow: false,
  };

  const mockOnChange = jest.fn();

  it('renders all fields', () => {
    render(<UserFormFields formData={mockFormData} onChange={mockOnChange} />);

    expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Shadow User/i)).toBeInTheDocument();
  });

  it('email is required by default', () => {
    render(<UserFormFields formData={mockFormData} onChange={mockOnChange} />);
    const emailInput = screen.getByLabelText(/^Email/i);
    expect(emailInput).toBeRequired();
    expect(screen.getByText(/Email \*/)).toBeInTheDocument();
  });

  it('email is optional when isShadow is true', () => {
    const shadowFormData = { ...mockFormData, isShadow: true };
    render(<UserFormFields formData={shadowFormData} onChange={mockOnChange} />);

    const emailInput = screen.getByLabelText(/^Email/i);
    expect(emailInput).not.toBeRequired();
    expect(screen.getByText(/Email \(Optional\)/)).toBeInTheDocument();
    expect(emailInput).toHaveAttribute('placeholder', 'No email required for shadow user');
  });

  it('calls onChange when shadow checkbox is clicked', () => {
    render(<UserFormFields formData={mockFormData} onChange={mockOnChange} />);

    const shadowCheckbox = screen.getByLabelText(/Shadow User/i);
    fireEvent.click(shadowCheckbox);

    expect(mockOnChange).toHaveBeenCalled();
  });
});

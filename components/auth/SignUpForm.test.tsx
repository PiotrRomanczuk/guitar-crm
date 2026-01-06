import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SignUpForm from '@/components/auth/SignUpForm';

// Mock Supabase browser client
const mockSignUp = jest.fn();

jest.mock('@/lib/supabase-browser', () => ({
	getSupabaseBrowserClient: jest.fn(() => ({
		auth: {
			signUp: mockSignUp,
		},
	})),
}));

describe('SignUpForm', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('Rendering', () => {
		it('should render sign up form with all required fields', () => {
			render(<SignUpForm />);

			expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
			expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
			expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
			expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
			expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
			expect(
				screen.getByRole('button', { name: /^sign up$/i })
			).toBeInTheDocument();
		});

		it('should render link to sign in page', () => {
			render(<SignUpForm />);

			const signInLink = screen.getByText(/already have an account/i);
			expect(signInLink).toBeInTheDocument();
		});

		it('should render password strength indicator when focused', async () => {
			render(<SignUpForm />);

			const passwordInput = screen.getByLabelText(/^password$/i);
			fireEvent.focus(passwordInput);
			
			await waitFor(() => {
				expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
			});
		});
	});

	describe('Form Validation', () => {
		it('should show error for invalid email format', async () => {
			render(<SignUpForm />);

			const emailInput = screen.getByLabelText(/email/i);
			fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
			fireEvent.blur(emailInput);

			await waitFor(() => {
				expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
			});
		});

		it('should show error for password shorter than 6 characters', async () => {
			render(<SignUpForm />);

			const passwordInput = screen.getByLabelText(/^password$/i);
			fireEvent.change(passwordInput, { target: { value: '12345' } });
			fireEvent.blur(passwordInput);

			await waitFor(() => {
				expect(
					screen.getByText(/password must be at least 6 characters/i)
				).toBeInTheDocument();
			});
		});

		it('should show error when first name is missing', async () => {
			render(<SignUpForm />);

			const firstNameInput = screen.getByLabelText(/first name/i);
			fireEvent.change(firstNameInput, { target: { value: '' } });
			fireEvent.blur(firstNameInput);

			await waitFor(() => {
				expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
			});
		});

		it('should show error when last name is missing', async () => {
			render(<SignUpForm />);

			const lastNameInput = screen.getByLabelText(/last name/i);
			fireEvent.change(lastNameInput, { target: { value: '' } });
			fireEvent.blur(lastNameInput);

			await waitFor(() => {
				expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
			});
		});

		it('should not submit form with validation errors', async () => {
			render(<SignUpForm />);

			const submitButton = screen.getByRole('button', { name: /^sign up$/i });
			fireEvent.click(submitButton);

			await waitFor(() => {
				expect(mockSignUp).not.toHaveBeenCalled();
			});
		});
	});

	describe('Form Submission', () => {
		it('should call signUp with correct data on valid submission', async () => {
			mockSignUp.mockResolvedValue({
				data: {
					user: {
						id: '123',
						identities: [{ id: '123' }], // Non-empty identities = new user
					},
					session: null,
				},
				error: null,
			});

			render(<SignUpForm />);

			fireEvent.change(screen.getByLabelText(/email/i), {
				target: { value: 'student@example.com' },
			});
			fireEvent.change(screen.getByLabelText(/^password$/i), {
				target: { value: 'test123_student' },
			});
			fireEvent.change(screen.getByLabelText(/confirm password/i), {
				target: { value: 'test123_student' },
			});
			fireEvent.change(screen.getByLabelText(/first name/i), {
				target: { value: 'John' },
			});
			fireEvent.change(screen.getByLabelText(/last name/i), {
				target: { value: 'Doe' },
			});

			const submitButton = screen.getByRole('button', { name: /^sign up$/i });
			fireEvent.click(submitButton);

			await waitFor(() => {
				expect(mockSignUp).toHaveBeenCalledWith({
					email: 'student@example.com',
					password: 'test123_student',
					options: {
						data: {
							first_name: 'John',
							last_name: 'Doe',
						},
					},
				});
			});
		});

		it('should show success message on successful sign up', async () => {
			mockSignUp.mockResolvedValue({
				data: {
					user: {
						id: '123',
						identities: [{ id: '123' }], // Non-empty identities = new user
					},
					session: null,
				},
				error: null,
			});

			render(<SignUpForm />);

			fireEvent.change(screen.getByLabelText(/email/i), {
				target: { value: 'student@example.com' },
			});
			fireEvent.change(screen.getByLabelText(/^password$/i), {
				target: { value: 'test123_student' },
			});
			fireEvent.change(screen.getByLabelText(/confirm password/i), {
				target: { value: 'test123_student' },
			});
			fireEvent.change(screen.getByLabelText(/first name/i), {
				target: { value: 'John' },
			});
			fireEvent.change(screen.getByLabelText(/last name/i), {
				target: { value: 'Doe' },
			});

			fireEvent.click(screen.getByRole('button', { name: /^sign up$/i }));

			await waitFor(() => {
				expect(
					screen.getByText(/check your email for confirmation/i)
				).toBeInTheDocument();
			});
		});

		it('should show error message on sign up failure', async () => {
			mockSignUp.mockResolvedValue({
				data: { user: null, session: null },
				error: { message: 'User already registered' },
			});

			render(<SignUpForm />);

			fireEvent.change(screen.getByLabelText(/email/i), {
				target: { value: 'student@example.com' },
			});
			fireEvent.change(screen.getByLabelText(/^password$/i), {
				target: { value: 'test123_student' },
			});
			fireEvent.change(screen.getByLabelText(/confirm password/i), {
				target: { value: 'test123_student' },
			});
			fireEvent.change(screen.getByLabelText(/first name/i), {
				target: { value: 'John' },
			});
			fireEvent.change(screen.getByLabelText(/last name/i), {
				target: { value: 'Doe' },
			});

			fireEvent.click(screen.getByRole('button', { name: /^sign up$/i }));

			await waitFor(() => {
				expect(
					screen.getByText(/user already registered/i)
				).toBeInTheDocument();
			});
		});

		it('should show user-friendly error when user already exists', async () => {
			mockSignUp.mockResolvedValue({
				data: {
					user: {
						id: '123',
						identities: [], // Empty identities array indicates duplicate
					},
					session: null,
				},
				error: null,
			});

			render(<SignUpForm />);

			fireEvent.change(screen.getByLabelText(/email/i), {
				target: { value: 'student@example.com' },
			});
			fireEvent.change(screen.getByLabelText(/^password$/i), {
				target: { value: 'test123_student' },
			});
			fireEvent.change(screen.getByLabelText(/confirm password/i), {
				target: { value: 'test123_student' },
			});
			fireEvent.change(screen.getByLabelText(/first name/i), {
				target: { value: 'John' },
			});
			fireEvent.change(screen.getByLabelText(/last name/i), {
				target: { value: 'Doe' },
			});

			fireEvent.click(screen.getByRole('button', { name: /^sign up$/i }));

			await waitFor(() => {
				expect(
					screen.getByText(
						/this email is already registered\. please sign in instead/i
					)
				).toBeInTheDocument();
			});
		});

		it('should disable submit button while submitting', async () => {
			mockSignUp.mockImplementation(
				() =>
					new Promise((resolve) =>
						setTimeout(
							() =>
								resolve({
									data: {
										user: {
											id: '123',
											identities: [{ id: '123' }],
										},
										session: null,
									},
									error: null,
								}),
							100
						)
					)
			);

			render(<SignUpForm />);

			fireEvent.change(screen.getByLabelText(/email/i), {
				target: { value: 'student@example.com' },
			});
			fireEvent.change(screen.getByLabelText(/^password$/i), {
				target: { value: 'test123_student' },
			});
			fireEvent.change(screen.getByLabelText(/confirm password/i), {
				target: { value: 'test123_student' },
			});
			fireEvent.change(screen.getByLabelText(/first name/i), {
				target: { value: 'John' },
			});
			fireEvent.change(screen.getByLabelText(/last name/i), {
				target: { value: 'Doe' },
			});

			const submitButton = screen.getByRole('button', { name: /^sign up$/i });
			fireEvent.click(submitButton);

			await waitFor(() => {
				expect(submitButton).toBeDisabled();
			});
		});

		it('should show loading state while submitting', async () => {
			mockSignUp.mockImplementation(
				() =>
					new Promise((resolve) =>
						setTimeout(
							() =>
								resolve({
									data: {
										user: {
											id: '123',
											identities: [{ id: '123' }],
										},
										session: null,
									},
									error: null,
								}),
							100
						)
					)
			);

			render(<SignUpForm />);

			fireEvent.change(screen.getByLabelText(/email/i), {
				target: { value: 'student@example.com' },
			});
			fireEvent.change(screen.getByLabelText(/^password$/i), {
				target: { value: 'test123_student' },
			});
			fireEvent.change(screen.getByLabelText(/confirm password/i), {
				target: { value: 'test123_student' },
			});
			fireEvent.change(screen.getByLabelText(/first name/i), {
				target: { value: 'John' },
			});
			fireEvent.change(screen.getByLabelText(/last name/i), {
				target: { value: 'Doe' },
			});

			fireEvent.click(screen.getByRole('button', { name: /^sign up$/i }));

			await waitFor(() => {
				expect(screen.getByText(/signing up/i)).toBeInTheDocument();
			});
		});
	});
});

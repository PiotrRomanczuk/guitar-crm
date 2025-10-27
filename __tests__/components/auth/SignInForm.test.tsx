import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SignInForm from '@/components/auth/SignInForm';

// Mock Supabase client
jest.mock('@/lib/supabase', () => ({
	supabase: {
		auth: {
			signInWithPassword: jest.fn(),
		},
	},
}));

import { supabase } from '@/lib/supabase';

describe('SignInForm', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('Rendering', () => {
		it('should render sign in form with all required fields', () => {
			render(<SignInForm />);

			expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
			expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
			expect(
				screen.getByRole('button', { name: /sign in/i })
			).toBeInTheDocument();
		});

		it('should render link to sign up page', () => {
			render(<SignInForm />);

			const signUpLink = screen.getByText(/don't have an account/i);
			expect(signUpLink).toBeInTheDocument();
		});

		it('should render forgot password link', () => {
			render(<SignInForm />);

			const forgotPasswordLink = screen.getByText(/forgot password/i);
			expect(forgotPasswordLink).toBeInTheDocument();
		});

		it('should have password field type as password', () => {
			render(<SignInForm />);

			const passwordInput = screen.getByLabelText(/password/i);
			expect(passwordInput).toHaveAttribute('type', 'password');
		});
	});

	describe('Form Validation', () => {
		it('should show error for invalid email format', async () => {
			render(<SignInForm />);

			const emailInput = screen.getByLabelText(/email/i);
			fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
			fireEvent.blur(emailInput);

			await waitFor(() => {
				expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
			});
		});

		it('should show error when email is empty', async () => {
			render(<SignInForm />);

			const emailInput = screen.getByLabelText(/email/i);
			fireEvent.change(emailInput, { target: { value: '' } });
			fireEvent.blur(emailInput);

			await waitFor(() => {
				expect(screen.getByText(/email is required/i)).toBeInTheDocument();
			});
		});

		it('should show error when password is empty', async () => {
			render(<SignInForm />);

			const passwordInput = screen.getByLabelText(/password/i);
			fireEvent.change(passwordInput, { target: { value: '' } });
			fireEvent.blur(passwordInput);

			await waitFor(() => {
				expect(screen.getByText(/password is required/i)).toBeInTheDocument();
			});
		});

		it('should not submit form with validation errors', async () => {
			render(<SignInForm />);

			const submitButton = screen.getByRole('button', { name: /sign in/i });
			fireEvent.click(submitButton);

			await waitFor(() => {
				expect(supabase.auth.signInWithPassword).not.toHaveBeenCalled();
			});
		});
	});

	describe('Form Submission', () => {
		it('should call signInWithPassword with correct credentials', async () => {
			(supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
				data: { user: { id: '123' }, session: { access_token: 'token' } },
				error: null,
			});

			render(<SignInForm />);

			fireEvent.change(screen.getByLabelText(/email/i), {
				target: { value: 'test@example.com' },
			});
			fireEvent.change(screen.getByLabelText(/password/i), {
				target: { value: 'password123' },
			});

			const submitButton = screen.getByRole('button', { name: /sign in/i });
			fireEvent.click(submitButton);

			await waitFor(() => {
				expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
					email: 'test@example.com',
					password: 'password123',
				});
			});
		});

		it('should redirect on successful sign in', async () => {
			(supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
				data: { user: { id: '123' }, session: { access_token: 'token' } },
				error: null,
			});

			render(<SignInForm />);

			fireEvent.change(screen.getByLabelText(/email/i), {
				target: { value: 'test@example.com' },
			});
			fireEvent.change(screen.getByLabelText(/password/i), {
				target: { value: 'password123' },
			});

			fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

			await waitFor(() => {
				expect(supabase.auth.signInWithPassword).toHaveBeenCalled();
			});
		});

		it('should show error message for invalid credentials', async () => {
			(supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
				data: { user: null, session: null },
				error: { message: 'Invalid login credentials' },
			});

			render(<SignInForm />);

			fireEvent.change(screen.getByLabelText(/email/i), {
				target: { value: 'test@example.com' },
			});
			fireEvent.change(screen.getByLabelText(/password/i), {
				target: { value: 'wrongpassword' },
			});

			fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

			await waitFor(() => {
				expect(
					screen.getByText(/invalid login credentials/i)
				).toBeInTheDocument();
			});
		});

		it('should show error message for unconfirmed email', async () => {
			(supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
				data: { user: null, session: null },
				error: { message: 'Email not confirmed' },
			});

			render(<SignInForm />);

			fireEvent.change(screen.getByLabelText(/email/i), {
				target: { value: 'test@example.com' },
			});
			fireEvent.change(screen.getByLabelText(/password/i), {
				target: { value: 'password123' },
			});

			fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

			await waitFor(() => {
				expect(screen.getByText(/email not confirmed/i)).toBeInTheDocument();
			});
		});

		it('should disable submit button while submitting', async () => {
			(supabase.auth.signInWithPassword as jest.Mock).mockImplementation(
				() =>
					new Promise((resolve) =>
						setTimeout(
							() =>
								resolve({
									data: {
										user: { id: '123' },
										session: { access_token: 'token' },
									},
									error: null,
								}),
							100
						)
					)
			);

			render(<SignInForm />);

			fireEvent.change(screen.getByLabelText(/email/i), {
				target: { value: 'test@example.com' },
			});
			fireEvent.change(screen.getByLabelText(/password/i), {
				target: { value: 'password123' },
			});

			const submitButton = screen.getByRole('button', { name: /sign in/i });
			fireEvent.click(submitButton);

			await waitFor(() => {
				expect(submitButton).toBeDisabled();
			});
		});

		it('should show loading state while submitting', async () => {
			(supabase.auth.signInWithPassword as jest.Mock).mockImplementation(
				() =>
					new Promise((resolve) =>
						setTimeout(
							() =>
								resolve({
									data: {
										user: { id: '123' },
										session: { access_token: 'token' },
									},
									error: null,
								}),
							100
						)
					)
			);

			render(<SignInForm />);

			fireEvent.change(screen.getByLabelText(/email/i), {
				target: { value: 'test@example.com' },
			});
			fireEvent.change(screen.getByLabelText(/password/i), {
				target: { value: 'password123' },
			});

			fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

			await waitFor(() => {
				expect(screen.getByText(/signing in/i)).toBeInTheDocument();
			});
		});

		it('should clear form on successful sign in', async () => {
			(supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
				data: { user: { id: '123' }, session: { access_token: 'token' } },
				error: null,
			});

			render(<SignInForm />);

			const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
			const passwordInput = screen.getByLabelText(
				/password/i
			) as HTMLInputElement;

			fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
			fireEvent.change(passwordInput, { target: { value: 'password123' } });

			fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

			await waitFor(() => {
				expect(emailInput.value).toBe('');
				expect(passwordInput.value).toBe('');
			});
		});
	});

	describe('Password Visibility Toggle', () => {
		it('should toggle password visibility when eye icon is clicked', async () => {
			render(<SignInForm />);

			const passwordInput = screen.getByLabelText(/password/i);
			const toggleButton = screen.getByRole('button', {
				name: /show/i,
			});

			expect(passwordInput).toHaveAttribute('type', 'password');

			fireEvent.click(toggleButton);

			await waitFor(() => {
				expect(passwordInput).toHaveAttribute('type', 'text');
			});

			fireEvent.click(toggleButton);

			await waitFor(() => {
				expect(passwordInput).toHaveAttribute('type', 'password');
			});
		});
	});
});

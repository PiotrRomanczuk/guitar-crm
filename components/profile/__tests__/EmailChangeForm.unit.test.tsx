import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EmailChangeForm } from '../EmailChangeForm';

const mockRequestEmailChange = jest.fn();

jest.mock('@/app/actions/account', () => ({
	requestEmailChange: (...args: unknown[]) => mockRequestEmailChange(...args),
}));

beforeEach(() => {
	jest.clearAllMocks();
});

describe('EmailChangeForm', () => {
	it('should render with current email', () => {
		render(<EmailChangeForm currentEmail="old@example.com" />);
		expect(screen.getByText(/Current: old@example.com/)).toBeInTheDocument();
		expect(screen.getByLabelText(/New Email Address/)).toBeInTheDocument();
	});

	it('should validate email format', async () => {
		render(<EmailChangeForm currentEmail="old@example.com" />);

		const input = screen.getByLabelText(/New Email Address/);
		const form = input.closest('form')!;
		fireEvent.change(input, { target: { value: 'not-an-email' } });
		fireEvent.submit(form);

		await waitFor(() => {
			expect(screen.getByText(/valid email/i)).toBeInTheDocument();
		});
		expect(mockRequestEmailChange).not.toHaveBeenCalled();
	});

	it('should reject same email', async () => {
		render(<EmailChangeForm currentEmail="old@example.com" />);

		const input = screen.getByLabelText(/New Email Address/);
		fireEvent.change(input, { target: { value: 'old@example.com' } });
		fireEvent.click(screen.getByRole('button', { name: /Send Confirmation/ }));

		await waitFor(() => {
			expect(screen.getByText(/different from your current/i)).toBeInTheDocument();
		});
	});

	it('should submit and show success', async () => {
		mockRequestEmailChange.mockResolvedValue({ success: true, message: 'Confirmation sent' });
		render(<EmailChangeForm currentEmail="old@example.com" />);

		const input = screen.getByLabelText(/New Email Address/);
		fireEvent.change(input, { target: { value: 'new@example.com' } });
		fireEvent.click(screen.getByRole('button', { name: /Send Confirmation/ }));

		await waitFor(() => {
			expect(screen.getByText(/Confirmation sent/)).toBeInTheDocument();
		});
		expect(mockRequestEmailChange).toHaveBeenCalledWith('new@example.com');
	});

	it('should show server error', async () => {
		mockRequestEmailChange.mockResolvedValue({ error: 'Email already in use' });
		render(<EmailChangeForm currentEmail="old@example.com" />);

		const input = screen.getByLabelText(/New Email Address/);
		fireEvent.change(input, { target: { value: 'taken@example.com' } });
		fireEvent.click(screen.getByRole('button', { name: /Send Confirmation/ }));

		await waitFor(() => {
			expect(screen.getByText(/Email already in use/)).toBeInTheDocument();
		});
	});
});

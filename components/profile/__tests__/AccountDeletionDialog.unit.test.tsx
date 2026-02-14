import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AccountDeletionDialog } from '../AccountDeletionDialog';

const mockRequestAccountDeletion = jest.fn();
const mockCancelAccountDeletion = jest.fn();

jest.mock('@/app/actions/account', () => ({
	requestAccountDeletion: (...args: unknown[]) => mockRequestAccountDeletion(...args),
	cancelAccountDeletion: (...args: unknown[]) => mockCancelAccountDeletion(...args),
}));

beforeEach(() => {
	jest.clearAllMocks();
});

describe('AccountDeletionDialog', () => {
	it('should show delete button when no deletion is scheduled', () => {
		render(<AccountDeletionDialog />);
		expect(screen.getByRole('button', { name: /Delete Account/i })).toBeInTheDocument();
		expect(screen.getByText(/30-day grace period/i)).toBeInTheDocument();
	});

	it('should show cancellation UI when deletion is scheduled', () => {
		render(<AccountDeletionDialog deletionScheduledFor="2025-03-15T00:00:00Z" />);
		expect(screen.getByText(/Scheduled for Deletion/i)).toBeInTheDocument();
		expect(screen.getByText(/Cancel Deletion/i)).toBeInTheDocument();
	});

	it('should cancel deletion when cancel button clicked', async () => {
		mockCancelAccountDeletion.mockResolvedValue({ success: true });
		render(<AccountDeletionDialog deletionScheduledFor="2025-03-15T00:00:00Z" />);

		fireEvent.click(screen.getByText(/Cancel Deletion/));

		await waitFor(() => {
			expect(mockCancelAccountDeletion).toHaveBeenCalled();
		});
	});

	it('should open confirmation dialog on delete', async () => {
		render(<AccountDeletionDialog />);

		// Click the delete button to open the dialog
		fireEvent.click(screen.getByRole('button', { name: /Delete Account/ }));

		await waitFor(() => {
			expect(screen.getByText(/Are you absolutely sure/i)).toBeInTheDocument();
		});
	});

	it('should require typing DELETE to confirm', async () => {
		render(<AccountDeletionDialog />);

		fireEvent.click(screen.getByRole('button', { name: /Delete Account/ }));

		await waitFor(() => {
			expect(screen.getByText(/Are you absolutely sure/i)).toBeInTheDocument();
		});

		// The action button should be disabled until "DELETE" is typed
		const confirmButton = screen.getByRole('button', { name: /Delete My Account/ });
		expect(confirmButton).toBeDisabled();

		// Type DELETE
		const input = screen.getByPlaceholderText(/Type "DELETE"/);
		fireEvent.change(input, { target: { value: 'DELETE' } });

		expect(confirmButton).not.toBeDisabled();
	});

	it('should call requestAccountDeletion on confirm', async () => {
		mockRequestAccountDeletion.mockResolvedValue({
			success: true,
			scheduledFor: '2025-03-15T00:00:00Z',
		});

		render(<AccountDeletionDialog />);

		fireEvent.click(screen.getByRole('button', { name: /Delete Account/ }));

		await waitFor(() => {
			expect(screen.getByText(/Are you absolutely sure/i)).toBeInTheDocument();
		});

		const input = screen.getByPlaceholderText(/Type "DELETE"/);
		fireEvent.change(input, { target: { value: 'DELETE' } });

		fireEvent.click(screen.getByRole('button', { name: /Delete My Account/ }));

		await waitFor(() => {
			expect(mockRequestAccountDeletion).toHaveBeenCalled();
		});
	});
});

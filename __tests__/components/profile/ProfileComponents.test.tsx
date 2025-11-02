import React from 'react';
import { render, screen } from '@testing-library/react';
import {
	ProfileHeader,
	ProfileAlert,
	ProfileFormActions,
	ProfileLoadingState,
} from '@/components/profile/ProfileComponents';

describe('ProfileComponents', () => {
	describe('ProfileHeader', () => {
		it('should render header with correct text', () => {
			render(<ProfileHeader />);
			expect(screen.getByText(/Edit Profile/)).toBeInTheDocument();
			expect(
				screen.getByText('Update your personal information')
			).toBeInTheDocument();
		});
	});

	describe('ProfileAlert', () => {
		it('should render success alert with message', () => {
			render(
				<ProfileAlert type='success' message='Profile saved successfully!' />
			);
			expect(
				screen.getByText(/Profile saved successfully!/)
			).toBeInTheDocument();
		});

		it('should render error alert with message', () => {
			render(<ProfileAlert type='error' message='Save failed' />);
			expect(screen.getByText('Error')).toBeInTheDocument();
			expect(screen.getByText('Save failed')).toBeInTheDocument();
		});
	});

	describe('ProfileFormActions', () => {
		it('should render save and cancel buttons', () => {
			render(<ProfileFormActions saving={false} onCancel={jest.fn()} />);
			expect(screen.getByText('Save Changes')).toBeInTheDocument();
			expect(screen.getByText('Cancel')).toBeInTheDocument();
		});

		it('should show saving state', () => {
			render(<ProfileFormActions saving={true} onCancel={jest.fn()} />);
			expect(screen.getByText('Saving...')).toBeInTheDocument();
		});

		it('should disable buttons when saving', () => {
			render(<ProfileFormActions saving={true} onCancel={jest.fn()} />);
			const buttons = screen.getAllByRole('button');
			buttons.forEach((button) => {
				expect(button).toBeDisabled();
			});
		});
	});

	describe('ProfileLoadingState', () => {
		it('should render loading spinner when loading is true', () => {
			const { container } = render(<ProfileLoadingState loading={true} />);
			expect(container.querySelector('.animate-spin')).toBeInTheDocument();
		});

		it('should not render anything when loading is false', () => {
			const { container } = render(<ProfileLoadingState loading={false} />);
			expect(container.firstChild).toBeNull();
		});
	});
});

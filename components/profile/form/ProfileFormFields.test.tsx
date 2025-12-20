import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfileFormFields } from '@/components/profile';
import { ProfileEdit } from '@/schemas/ProfileSchema';

describe('ProfileFormFields', () => {
	const mockOnChange = jest.fn();
	const defaultFormData: ProfileEdit = {
		firstname: '',
		lastname: '',
		username: '',
		bio: '',
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('should render all form fields', () => {
		render(
			<ProfileFormFields
				formData={defaultFormData}
				userEmail='test@example.com'
				onChange={mockOnChange}
			/>
		);

		expect(screen.getByLabelText(/First Name/)).toBeInTheDocument();
		expect(screen.getByLabelText(/Last Name/)).toBeInTheDocument();
		expect(screen.getByLabelText('Username')).toBeInTheDocument();
		expect(screen.getByLabelText('Bio')).toBeInTheDocument();
		expect(screen.getByLabelText('Email')).toBeInTheDocument();
	});

	it('should display user email as disabled', () => {
		render(
			<ProfileFormFields
				formData={defaultFormData}
				userEmail='test@example.com'
				onChange={mockOnChange}
			/>
		);

		const emailInput = screen.getByDisplayValue('test@example.com');
		expect(emailInput).toBeDisabled();
	});

	it('should call onChange when first name is updated', async () => {
		const user = userEvent.setup();
		render(
			<ProfileFormFields
				formData={defaultFormData}
				userEmail='test@example.com'
				onChange={mockOnChange}
			/>
		);

		const firstNameInput = screen.getByLabelText(/First Name/);
		await user.type(firstNameInput, 'John');

		expect(mockOnChange).toHaveBeenCalled();
	});

	it('should display existing form data', () => {
		const existingData: ProfileEdit = {
			firstname: 'Jane',
			lastname: 'Smith',
			username: 'janesmith',
			bio: 'Test bio',
		};

		render(
			<ProfileFormFields
				formData={existingData}
				userEmail='test@example.com'
				onChange={mockOnChange}
			/>
		);

		expect(screen.getByDisplayValue('Jane')).toBeInTheDocument();
		expect(screen.getByDisplayValue('Smith')).toBeInTheDocument();
		expect(screen.getByDisplayValue('janesmith')).toBeInTheDocument();
		expect(screen.getByDisplayValue('Test bio')).toBeInTheDocument();
	});

	it('should handle bio character count', () => {
		const dataWithBio: ProfileEdit = {
			firstname: 'John',
			lastname: 'Doe',
			username: '',
			bio: 'Hello',
		};

		render(
			<ProfileFormFields
				formData={dataWithBio}
				userEmail='test@example.com'
				onChange={mockOnChange}
			/>
		);

		expect(screen.getByText('5/500 characters')).toBeInTheDocument();
	});
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
	SettingsHeader,
	SettingsSection,
	ToggleSetting,
	SelectSetting,
} from '@/components/settings/SettingsComponents';

describe('SettingsComponents', () => {
	describe('SettingsHeader', () => {
		it('should render header with correct text', () => {
			render(<SettingsHeader />);
			expect(screen.getByText(/Settings/)).toBeInTheDocument();
			expect(
				screen.getByText('Manage your preferences and account settings')
			).toBeInTheDocument();
		});
	});

	describe('SettingsSection', () => {
		it('should render section with title and description', () => {
			render(
				<SettingsSection title="Test Section" description="Test description">
					<div>Content</div>
				</SettingsSection>
			);
			expect(screen.getByText('Test Section')).toBeInTheDocument();
			expect(screen.getByText('Test description')).toBeInTheDocument();
			expect(screen.getByText('Content')).toBeInTheDocument();
		});
	});

	describe('ToggleSetting', () => {
		it('should render toggle with label and description', () => {
			render(
				<ToggleSetting
					label="Test Toggle"
					description="Toggle description"
					checked={false}
					onChange={jest.fn()}
				/>
			);
			expect(screen.getByText('Test Toggle')).toBeInTheDocument();
			expect(screen.getByText('Toggle description')).toBeInTheDocument();
		});

		it('should call onChange when toggled', async () => {
			const mockOnChange = jest.fn();
			const user = userEvent.setup();
			render(
				<ToggleSetting
					label="Test Toggle"
					description="Toggle description"
					checked={false}
					onChange={mockOnChange}
				/>
			);

			const toggle = screen.getByRole('switch');
			await user.click(toggle);
			expect(mockOnChange).toHaveBeenCalled();
		});
	});

	describe('SelectSetting', () => {
		const options = [
			{ value: 'option1', label: 'Option 1' },
			{ value: 'option2', label: 'Option 2' },
		];

		it('should render select with label and options', () => {
			render(
				<SelectSetting
					label="Test Select"
					description="Select description"
					value="option1"
					options={options}
					onChange={jest.fn()}
				/>
			);
			expect(screen.getByText('Test Select')).toBeInTheDocument();
			expect(screen.getByText('Select description')).toBeInTheDocument();
		});

		it('should call onChange when option is selected', async () => {
			const mockOnChange = jest.fn();
			const user = userEvent.setup();
			render(
				<SelectSetting
					label="Test Select"
					description="Select description"
					value="option1"
					options={options}
					onChange={mockOnChange}
				/>
			);

			const select = screen.getByRole('combobox');
			await user.selectOptions(select, 'option2');
			expect(mockOnChange).toHaveBeenCalled();
		});
	});
});

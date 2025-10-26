'use client';

import { useState } from 'react';
import { z } from 'zod';
import { UserUpdateSchema, type User } from '@/schemas/UserSchema';
import { TextInput } from './UserForm.TextInput';
import { UserFormHeader } from './UserForm.Header';
import { UserRoleSection } from './UserForm.RoleSection';
import { UserFormActions } from './UserForm.Actions';
import { createUserValidationSchema, extractValidationErrors } from './UserForm.helpers';

interface UserFormProps {
	mode: 'create' | 'edit';
	user?: User;
	onSubmit: (userData: Partial<User>) => Promise<void>;
	onCancel: () => void;
}

export function UserForm({ mode, user, onSubmit, onCancel }: UserFormProps) {
	const [formData, setFormData] = useState({
		firstName: user?.firstName ?? '',
		lastName: user?.lastName ?? '',
		email: user?.email ?? '',
		isAdmin: user?.isAdmin ?? false,
		isTeacher: user?.isTeacher ?? false,
		isStudent: user?.isStudent ?? false,
		isActive: user?.isActive ?? true
	});

	const [errors, setErrors] = useState<Record<string, string>>({});
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrors({});
		setLoading(true);

		try {
			if (mode === 'create') {
				const validationSchema = createUserValidationSchema();
				validationSchema.parse(formData);
			} else {
				UserUpdateSchema.parse({ ...formData, id: user?.id });
			}

			await onSubmit(formData);
		} catch (error) {
			if (error instanceof z.ZodError) {
				setErrors(extractValidationErrors(error));
			} else if (error instanceof Error) {
				setErrors({ general: error.message });
			}
		} finally {
			setLoading(false);
		}
	};

	const handleInputChange = (field: string, value: string | boolean) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: '' }));
		}
	};

	return (
		<form onSubmit={handleSubmit} className='p-6 space-y-6'>
			<UserFormHeader 
				mode={mode} 
				onCancel={onCancel} 
				generalError={errors.general}
			/>

			<div className='grid grid-cols-2 gap-4'>
				<TextInput
					id='firstName'
					label='First Name'
					value={formData.firstName}
					error={errors.firstName}
					placeholder='Enter first name'
					required
					onChange={(value) => handleInputChange('firstName', value)}
				/>
				<TextInput
					id='lastName'
					label='Last Name'
					value={formData.lastName}
					error={errors.lastName}
					placeholder='Enter last name'
					required
					onChange={(value) => handleInputChange('lastName', value)}
				/>
			</div>

			<TextInput
				id='email'
				type='email'
				label='Email Address'
				value={formData.email}
				error={errors.email}
				placeholder='Enter email address'
				required
				onChange={(value) => handleInputChange('email', value)}
			/>

			<UserRoleSection
				isAdmin={formData.isAdmin}
				isTeacher={formData.isTeacher}
				isStudent={formData.isStudent}
				isActive={formData.isActive}
				onChange={handleInputChange}
			/>

			<UserFormActions
				mode={mode}
				loading={loading}
				onCancel={onCancel}
			/>
		</form>
	);
}
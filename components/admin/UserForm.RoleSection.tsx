import { CheckboxInput } from './UserForm.CheckboxInput';

interface UserRoleSectionProps {
	isAdmin: boolean;
	isTeacher: boolean;
	isStudent: boolean;
	isActive: boolean;
	onChange: (field: string, value: boolean) => void;
}

export function UserRoleSection({
	isAdmin,
	isTeacher,
	isStudent,
	isActive,
	onChange,
}: UserRoleSectionProps) {
	return (
		<>
			<div>
				<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3'>
					User Roles
				</label>
				<div className='space-y-2'>
					<CheckboxInput
						id='isAdmin'
						label='Admin'
						description='Full system access and user management'
						checked={isAdmin}
						onChange={(checked) => onChange('isAdmin', checked)}
					/>
					<CheckboxInput
						id='isTeacher'
						label='Teacher'
						description='Can manage students, lessons, and songs'
						checked={isTeacher}
						onChange={(checked) => onChange('isTeacher', checked)}
					/>
					<CheckboxInput
						id='isStudent'
						label='Student'
						description='Can view assigned lessons and songs'
						checked={isStudent}
						onChange={(checked) => onChange('isStudent', checked)}
					/>
				</div>
			</div>

			<div>
				<CheckboxInput
					id='isActive'
					label='Active User'
					checked={isActive}
					onChange={(checked) => onChange('isActive', checked)}
				/>
				<p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
					Inactive users cannot sign in to the system
				</p>
			</div>
		</>
	);
}

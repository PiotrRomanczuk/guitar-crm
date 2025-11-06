import { CheckboxInput } from './UserForm.CheckboxInput';
import { Label } from '@/components/ui/label';

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
			<div className='space-y-3'>
				<Label className='text-sm font-medium'>User Roles</Label>
				<div className='space-y-3'>
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

			<div className='space-y-2'>
				<CheckboxInput
					id='isActive'
					label='Active User'
					checked={isActive}
					onChange={(checked) => onChange('isActive', checked)}
				/>
				<p className='text-xs text-muted-foreground'>
					Inactive users cannot sign in to the system
				</p>
			</div>
		</>
	);
}

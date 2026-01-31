import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ProfileEdit } from '@/schemas/ProfileSchema';

interface ProfileFormFieldsProps {
	formData: ProfileEdit;
	userEmail?: string;
	onChange: (data: ProfileEdit) => void;
}

interface TextFieldProps {
	id: string;
	label: string;
	value: string;
	onChange: (value: string) => void;
	required?: boolean;
	placeholder?: string;
}

function TextField({
	id,
	label,
	value,
	onChange,
	required = false,
	placeholder,
}: TextFieldProps) {
	return (
		<div className='space-y-2'>
			<Label htmlFor={id} className='text-sm sm:text-base'>
				{label} {required && '*'}
			</Label>
			<Input
				id={id}
				type='text'
				value={value}
				onChange={(e) => onChange(e.target.value)}
				required={required}
				className='text-xs sm:text-sm'
				placeholder={placeholder}
			/>
		</div>
	);
}

function BioField({
	value,
	onChange,
}: {
	value: string;
	onChange: (value: string) => void;
}) {
	return (
		<div className='space-y-2'>
			<Label htmlFor='bio' className='text-sm sm:text-base'>
				Bio
			</Label>
			<textarea
				id='bio'
				value={value}
				onChange={(e) => onChange(e.target.value)}
				className='w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm border border-border bg-background rounded-lg shadow-sm transition-all duration-200 text-foreground hover:border-muted-foreground hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary focus:shadow-lg min-h-24'
				placeholder='Tell us about yourself (optional)'
				maxLength={500}
			/>
			<p className='text-xs text-muted-foreground'>
				{value?.length || 0}/500 characters
			</p>
		</div>
	);
}

function EmailField({ email }: { email?: string }) {
	return (
		<div className='space-y-2'>
			<Label htmlFor='email' className='text-sm sm:text-base'>
				Email
			</Label>
			<Input
				id='email'
				type='email'
				value={email || ''}
				disabled
				className='text-xs sm:text-sm bg-muted'
			/>
			<p className='text-xs text-muted-foreground'>
				Email cannot be changed here. Contact support to update your email.
			</p>
		</div>
	);
}

export function ProfileFormFields({
	formData,
	userEmail,
	onChange,
}: ProfileFormFieldsProps) {
	return (
		<div className='space-y-4'>
			<TextField
				id='firstname'
				label='First Name'
				value={formData.firstname}
				onChange={(value) => onChange({ ...formData, firstname: value })}
				required
				placeholder='Enter your first name'
			/>
			<TextField
				id='lastname'
				label='Last Name'
				value={formData.lastname}
				onChange={(value) => onChange({ ...formData, lastname: value })}
				required
				placeholder='Enter your last name'
			/>
			<TextField
				id='username'
				label='Username'
				value={formData.username || ''}
				onChange={(value) => onChange({ ...formData, username: value })}
				placeholder='Choose a username (optional)'
			/>
			<BioField
				value={formData.bio || ''}
				onChange={(value) => onChange({ ...formData, bio: value })}
			/>
			<EmailField email={userEmail} />
		</div>
	);
}

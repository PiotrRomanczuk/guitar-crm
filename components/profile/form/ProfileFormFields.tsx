import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ProfileEdit } from '@/schemas/ProfileSchema';

interface ProfileFormFieldsProps {
	formData: ProfileEdit;
	userEmail?: string;
	errors?: Record<string, string>;
	onChange: (data: ProfileEdit) => void;
	onBlur?: (field: string) => void;
}

interface TextFieldProps {
	id: string;
	label: string;
	value: string;
	error?: string;
	onChange: (value: string) => void;
	onBlur?: () => void;
	required?: boolean;
	placeholder?: string;
}

function TextField({
	id,
	label,
	value,
	error,
	onChange,
	onBlur,
	required = false,
	placeholder,
}: TextFieldProps) {
	return (
		<div className='space-y-2'>
			<Label htmlFor={id}>
				{label} {required && <span className="text-destructive">*</span>}
			</Label>
			<Input
				id={id}
				type='text'
				value={value}
				onChange={(e) => onChange(e.target.value)}
				onBlur={onBlur}
				required={required}
				placeholder={placeholder}
				aria-invalid={!!error}
			/>
			{error && (
				<p className="text-sm text-destructive" role="alert">
					{error}
				</p>
			)}
		</div>
	);
}

function BioField({
	value,
	error,
	onChange,
	onBlur,
}: {
	value: string;
	error?: string;
	onChange: (value: string) => void;
	onBlur?: () => void;
}) {
	return (
		<div className='space-y-2'>
			<Label htmlFor='bio'>
				Bio
			</Label>
			<textarea
				id='bio'
				value={value}
				onChange={(e) => onChange(e.target.value)}
				onBlur={onBlur}
				className={`w-full px-3 py-2 text-sm border rounded-md shadow-xs transition-all duration-200 text-foreground bg-background dark:bg-input/30 focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring min-h-24 ${
					error
						? 'border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40'
						: 'border-input hover:border-muted-foreground'
				}`}
				placeholder='Tell us about yourself (optional)'
				maxLength={500}
				aria-invalid={!!error}
			/>
			{error && (
				<p className="text-sm text-destructive" role="alert">
					{error}
				</p>
			)}
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
	errors = {},
	onChange,
	onBlur,
}: ProfileFormFieldsProps) {
	return (
		<div className='space-y-4'>
			<TextField
				id='firstname'
				label='First Name'
				value={formData.firstname}
				error={errors.firstname}
				onChange={(value) => onChange({ ...formData, firstname: value })}
				onBlur={() => onBlur?.('firstname')}
				required
				placeholder='Enter your first name'
			/>
			<TextField
				id='lastname'
				label='Last Name'
				value={formData.lastname}
				error={errors.lastname}
				onChange={(value) => onChange({ ...formData, lastname: value })}
				onBlur={() => onBlur?.('lastname')}
				required
				placeholder='Enter your last name'
			/>
			<TextField
				id='username'
				label='Username'
				value={formData.username || ''}
				error={errors.username}
				onChange={(value) => onChange({ ...formData, username: value })}
				onBlur={() => onBlur?.('username')}
				placeholder='Choose a username (optional)'
			/>
			<BioField
				value={formData.bio || ''}
				error={errors.bio}
				onChange={(value) => onChange({ ...formData, bio: value })}
				onBlur={() => onBlur?.('bio')}
			/>
			<EmailField email={userEmail} />
		</div>
	);
}

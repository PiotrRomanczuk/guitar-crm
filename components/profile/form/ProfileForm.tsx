import type { ProfileEdit } from '@/schemas/ProfileSchema';
import { ProfileFormFields } from './ProfileFormFields';
import { ProfileFormActions } from '../ui/ProfileComponents';

interface ProfileFormProps {
	formData: ProfileEdit;
	userEmail?: string;
	errors?: Record<string, string>;
	saving: boolean;
	onSubmit: (e: React.FormEvent) => void;
	onChange: (data: ProfileEdit) => void;
	onBlur?: (field: string) => void;
	onCancel: () => void;
}

export function ProfileForm({
	formData,
	userEmail,
	errors,
	saving,
	onSubmit,
	onChange,
	onBlur,
	onCancel,
}: ProfileFormProps) {
	return (
		<form onSubmit={onSubmit} className='space-y-6'>
			<ProfileFormFields
				formData={formData}
				userEmail={userEmail}
				errors={errors}
				onChange={onChange}
				onBlur={onBlur}
			/>
			<ProfileFormActions saving={saving} onCancel={onCancel} />
		</form>
	);
}

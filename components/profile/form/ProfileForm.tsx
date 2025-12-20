import type { ProfileEdit } from '@/schemas/ProfileSchema';
import { ProfileFormFields } from './ProfileFormFields';
import { ProfileFormActions } from '../ui/ProfileComponents';

interface ProfileFormProps {
	formData: ProfileEdit;
	userEmail?: string;
	saving: boolean;
	onSubmit: (e: React.FormEvent) => void;
	onChange: (data: ProfileEdit) => void;
	onCancel: () => void;
}

export function ProfileForm({
	formData,
	userEmail,
	saving,
	onSubmit,
	onChange,
	onCancel,
}: ProfileFormProps) {
	return (
		<form onSubmit={onSubmit} className='space-y-6'>
			<ProfileFormFields
				formData={formData}
				userEmail={userEmail}
				onChange={onChange}
			/>
			<ProfileFormActions saving={saving} onCancel={onCancel} />
		</form>
	);
}

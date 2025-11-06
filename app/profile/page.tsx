'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useProfileData } from '@/components/profile/useProfileData';
import {
	ProfileLoadingState,
	ProfileHeader,
	ProfileAlert,
} from '@/components/profile/ProfileComponents';
import { ProfileForm } from '@/components/profile/ProfileForm';

export default function ProfilePage() {
	const router = useRouter();
	const {
		user,
		loading,
		saving,
		error,
		success,
		formData,
		setFormData,
		handleSubmit,
	} = useProfileData();

	useEffect(() => {
		if (!loading && !user) {
			router.push('/sign-in');
		}
	}, [user, loading, router]);

	if (loading) {
		return <ProfileLoadingState loading={loading} />;
	}

	return (
		<div className='min-h-screen bg-background'>
			<div className='container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-2xl'>
				<ProfileHeader />

				{error && <ProfileAlert type='error' message={error} />}
				{success && (
					<ProfileAlert type='success' message='Profile updated successfully' />
				)}

				<ProfileForm
					formData={formData}
					userEmail={user?.email}
					saving={saving}
					onSubmit={handleSubmit}
					onChange={setFormData}
					onCancel={() => router.back()}
				/>
			</div>
		</div>
	);
}

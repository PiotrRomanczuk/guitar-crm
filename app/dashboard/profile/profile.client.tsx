'use client';

import { useProfileData } from '@/components/profile/useProfileData';
import {
  ProfileHeader,
  ProfileAlert,
  ProfileLoadingState,
} from '@/components/profile/ProfileComponents';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { redirect } from 'next/navigation';

interface ProfilePageClientProps {
  userId: string;
}

export default function ProfilePageClient({ userId }: ProfilePageClientProps) {
  // Create a pseudo-user object for existing hook signature
  const { loading, saving, error, success, formData, setFormData, handleSubmit } = useProfileData({
    id: userId,
  });

  if (loading) {
    return <ProfileLoadingState loading={loading} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-2xl">
        <ProfileHeader />
        {error && <ProfileAlert type="error" message={error.message} />}
        {success && <ProfileAlert type="success" message="Profile updated successfully" />}
        <ProfileForm
          formData={formData}
          userEmail={undefined}
          saving={saving}
          onSubmit={handleSubmit}
          onChange={setFormData}
          onCancel={() => redirect('/dashboard')}
        />
      </div>
    </div>
  );
}

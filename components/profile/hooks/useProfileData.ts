'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ProfileEditSchema, type ProfileEdit } from '@/schemas/ProfileSchema';
import { queryClient } from '@/lib/query-client';

async function loadProfileFromDb(userId: string): Promise<ProfileEdit> {
  const supabase = createClient();
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();

  // If no profile exists yet, return empty form
  if (error && error.code === 'PGRST116') {
    return { firstname: '', lastname: '', username: '', bio: '' };
  }

  if (error) throw error;

  // Split full_name into firstname and lastname
  const nameParts = data.full_name ? data.full_name.split(' ') : ['', ''];
  const firstname = nameParts[0] || '';
  const lastname = nameParts.slice(1).join(' ') || '';

  return {
    firstname,
    lastname,
    username: data.username || '',
    bio: data.bio || '',
  };
}

async function saveProfileToDb(userId: string, profileData: ProfileEdit) {
  const validatedData = ProfileEditSchema.parse(profileData);

  // Combine firstname and lastname into full_name
  const fullName = `${validatedData.firstname} ${validatedData.lastname}`.trim();

  const supabase = createClient();
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .single();

  if (existingProfile) {
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        username: validatedData.username,
        bio: validatedData.bio,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('profiles').insert({
      id: userId,
      full_name: fullName,
      username: validatedData.username,
      bio: validatedData.bio,
    });
    if (error) throw error;
  }
}

export function useProfileData(user: { id: string } | null) {
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<ProfileEdit>({
    firstname: '',
    lastname: '',
    username: '',
    bio: '',
  });

  // Fetch profile data and populate form
  const { isLoading, error: fetchError } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const data = await loadProfileFromDb(user.id);
      setFormData(data);
      return data;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // Mutation for saving profile
  const {
    mutate: saveProfile,
    isPending: saving,
    error: saveError,
  } = useMutation({
    mutationFn: (data: ProfileEdit) => (user ? saveProfileToDb(user.id, data) : Promise.reject()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    saveProfile(formData);
  };

  const error = fetchError || saveError;

  return {
    user,
    loading: isLoading,
    saving,
    error,
    success,
    formData,
    setFormData,
    handleSubmit,
  };
}

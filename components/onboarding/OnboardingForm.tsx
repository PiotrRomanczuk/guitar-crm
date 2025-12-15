'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function OnboardingForm({ user }: { user: any }) {
  const [fullName, setFullName] = useState(user.user_metadata?.full_name || '');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          is_student: true, // Default to student
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Add to user_roles
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          role: 'student'
        });

      if (roleError) {
        // Ignore duplicate key error if role already exists
        if (roleError.code !== '23505') {
            console.error('Error adding role:', roleError);
        }
      }

      toast.success('Profile set up successfully!');
      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      <div className="rounded-md shadow-sm space-y-4">
        <div>
          <Label htmlFor="full-name">
            Full Name
          </Label>
          <Input
            id="full-name"
            name="full-name"
            type="text"
            required
            className="mt-1"
            placeholder="Your Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
      </div>

      <div>
        <Button
          type="submit"
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Setting up...' : 'Complete Setup'}
        </Button>
      </div>
    </form>
  );
}

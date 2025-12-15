'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { completeOnboarding } from '@/app/actions/onboarding';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function OnboardingForm({ user }: { user: any }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    try {
      const result = await completeOnboarding(formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('Profile set up successfully!');
      }
    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="mt-8 space-y-6" action={handleSubmit}>
      <div className="rounded-md shadow-sm space-y-4">
        <div>
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            name="fullName"
            type="text"
            required
            className="mt-1"
            placeholder="Your Full Name"
            defaultValue={user.user_metadata?.full_name || ''}
          />
        </div>
      </div>

      <div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Setting up...' : 'Complete Setup'}
        </Button>
      </div>
    </form>
  );
}

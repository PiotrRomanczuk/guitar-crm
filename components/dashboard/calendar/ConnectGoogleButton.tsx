'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';

export function ConnectGoogleButton() {
  const handleConnect = () => {
    window.location.href = '/api/auth/google';
  };

  return (
    <Button onClick={handleConnect} variant="outline" className="flex items-center gap-2">
      <Calendar className="w-4 h-4" />
      Connect Google Calendar
    </Button>
  );
}

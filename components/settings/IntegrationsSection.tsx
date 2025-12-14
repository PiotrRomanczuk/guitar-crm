'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, CheckCircle2, XCircle } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface IntegrationsSectionProps {
  isGoogleConnected: boolean;
}

export function IntegrationsSection({ isGoogleConnected }: IntegrationsSectionProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleConnect = () => {
    setLoading(true);
    router.push('/api/auth/google');
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Integrations</h3>
        <p className="text-sm text-muted-foreground">
          Manage your connections to third-party services.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Google Calendar
          </CardTitle>
          <CardDescription>
            Connect your Google Calendar to automatically sync lessons and create shadow users.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isGoogleConnected ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="font-medium text-green-600 dark:text-green-400">Connected</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-muted-foreground" />
                  <span className="text-muted-foreground">Not connected</span>
                </>
              )}
            </div>

            {isGoogleConnected ? (
              <Button variant="outline" disabled>
                Connected
              </Button>
            ) : (
              <Button onClick={handleConnect} disabled={loading}>
                {loading ? 'Connecting...' : 'Connect Google Calendar'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

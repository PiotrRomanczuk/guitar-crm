'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { performDatabaseBackup } from '@/app/dashboard/settings/actions';
import { Spinner } from '@/components/ui/spinner';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { SettingsSection } from './SettingsComponents';

export function DatabaseSection() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleBackup = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      const result = await performDatabaseBackup();
      if (result.success) {
        setMessage({ type: 'success', text: result.message || 'Backup created successfully.' });
      } else {
        setMessage({ type: 'error', text: result.error || 'Backup failed.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'An unexpected error occurred.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SettingsSection
      title="Database Management"
      description="Manage your database backups and maintenance."
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 dark:bg-gray-900/50">
          <div>
            <h4 className="font-medium text-sm sm:text-base">Full Database Backup</h4>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Create a complete backup of your database schema and data.
            </p>
          </div>
          <Button onClick={handleBackup} disabled={isLoading} size="sm">
            {isLoading ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Backing up...
              </>
            ) : (
              'Create Backup'
            )}
          </Button>
        </div>

        {message && (
          <div
            className={`p-3 rounded-lg flex items-center gap-2 text-sm ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900'
                : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <p className="font-medium">{message.text}</p>
          </div>
        )}
      </div>
    </SettingsSection>
  );
}

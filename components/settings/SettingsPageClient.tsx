'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useSettings } from '@/components/settings/useSettings';
import { SettingsHeader } from '@/components/settings/SettingsComponents';
import {
  NotificationsSection,
  AppearanceSection,
  PrivacySection,
} from '@/components/settings/SettingsSections';
import { IntegrationsSection } from '@/components/settings/IntegrationsSection';
import { ApiKeysSection } from '@/components/settings/ApiKeysSection';
import { BearerTokenCard } from '@/components/dashboard/BearerTokenCard';

function SettingsAlert({ type, message }: { type: 'error' | 'success'; message: string }) {
  if (type === 'error') {
    return (
      <div className="mb-6 rounded-lg border border-destructive bg-destructive/10 p-4">
        <p className="font-semibold text-destructive text-sm sm:text-base">Error</p>
        <p className="text-destructive mt-1 text-xs sm:text-sm">{message}</p>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-lg border border-success bg-success/10 p-4">
      <p className="font-semibold text-success text-sm sm:text-base">
        ✓ {message}
      </p>
    </div>
  );
}

function SettingsActions({
  hasChanges,
  saving,
  onSave,
  onReset,
  onCancel,
}: {
  hasChanges: boolean;
  saving: boolean;
  onSave: () => void;
  onReset: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 pt-4">
      <Button onClick={onSave} disabled={!hasChanges || saving} className="w-full sm:w-auto">
        {saving ? (
          <>
            <Spinner size="sm" className="mr-2" />
            Saving...
          </>
        ) : (
          'Save Changes'
        )}
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={onReset}
        disabled={saving}
        className="w-full sm:w-auto"
      >
        Reset to Defaults
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={saving}
        className="w-full sm:w-auto"
      >
        Cancel
      </Button>
    </div>
  );
}

export default function SettingsPageClient({
  isGoogleConnected = false,
  bearerToken,
}: {
  isGoogleConnected?: boolean;
  bearerToken?: string;
}) {
  const router = useRouter();
  const { loading, saving, settings, hasChanges, updateSetting, saveSettings, resetSettings } =
    useSettings();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    try {
      setError(null);
      setSuccess(false);
      await saveSettings();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-3xl">
        <SettingsHeader />

        {error && <SettingsAlert type="error" message={error} />}
        {success && <SettingsAlert type="success" message="Settings saved successfully" />}

        <div className="bg-card rounded-lg shadow-sm border border-border p-4 sm:p-6 space-y-8">
          <IntegrationsSection isGoogleConnected={isGoogleConnected} />
          <div className="border-t pt-6">
            <NotificationsSection settings={settings} updateSetting={updateSetting} />
          </div>
          <div className="border-t pt-6">
            <AppearanceSection settings={settings} updateSetting={updateSetting} />
          </div>
          <div className="border-t pt-6">
            <PrivacySection settings={settings} updateSetting={updateSetting} />
          </div>
          <div className="border-t pt-6">
            <ApiKeysSection />
          </div>
          {bearerToken && (
            <div className="border-t pt-6">
              <BearerTokenCard token={bearerToken} />
            </div>
          )}
          <div className="border-t pt-6">
            <SettingsActions
              hasChanges={hasChanges}
              saving={saving}
              onSave={handleSave}
              onReset={resetSettings}
              onCancel={() => router.back()}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// TODO: Replace localStorage persistence with a Supabase `user_settings` table; hydrate initial settings via server component props.

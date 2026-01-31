'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Server, Laptop, RefreshCw, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

interface DatabaseStatusProps {
  className?: string;
  variant?: 'fixed' | 'inline';
}

export function DatabaseStatus({ className, variant = 'fixed' }: DatabaseStatusProps) {
  const [isLocal, setIsLocal] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasLocalEnv, setHasLocalEnv] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'error'>(
    'unknown'
  );

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setLoading(true);
    try {
      console.log('[DatabaseStatus] Starting connection check...');

      // Check cookie preference
      const match = document.cookie.match(new RegExp('(^| )sb-provider-preference=([^;]+)'));
      const currentPref = match && match[2] === 'remote' ? 'remote' : 'local';

      // Check if local env vars exist
      const localUrl = process.env.NEXT_PUBLIC_SUPABASE_LOCAL_URL;
      const hasLocal = !!localUrl;
      setHasLocalEnv(hasLocal);

      // Determine what we are actually connected to
      const actuallyLocal = currentPref === 'local' && hasLocal;
      setIsLocal(actuallyLocal);

      // Test actual connection
      let supabase;
      try {
        supabase = createClient();
      } catch (err) {
        console.error('[DatabaseStatus] Failed to create Supabase client:', err);
        setConnectionStatus('error');
        return;
      }

      // Get the URL from the client to display it
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const clientUrl = (supabase as any).supabaseUrl;
      console.log('[DatabaseStatus] Testing connection to:', clientUrl);
      console.log('[DatabaseStatus] Starting connection check at:', new Date().toISOString());

      // Test basic connectivity first
      try {
        console.log('[DatabaseStatus] 🌐 Testing basic HTTP connectivity...');
        const testResponse = await fetch(`${clientUrl}/rest/v1/`, {
          method: 'HEAD',
          headers: {
            apikey: (supabase as any).supabaseKey,
          },
        });
        console.log('[DatabaseStatus] HTTP test response status:', testResponse.status);

        // Try a direct REST call to profiles table
        console.log('[DatabaseStatus] 🔍 Testing direct REST API call...');
        const restResponse = await fetch(`${clientUrl}/rest/v1/profiles?select=count&limit=0`, {
          method: 'HEAD',
          headers: {
            apikey: (supabase as any).supabaseKey,
            'Content-Type': 'application/json',
          },
        });
        console.log('[DatabaseStatus] REST API response status:', restResponse.status);
        console.log(
          '[DatabaseStatus] REST API response headers:',
          Object.fromEntries(restResponse.headers.entries())
        );

        if (restResponse.ok) {
          console.log('[DatabaseStatus] ✅ Direct REST API works - setting connected');
          setConnectionStatus('connected');
          return;
        }
      } catch (fetchError) {
        console.error('[DatabaseStatus] ❌ Basic HTTP connectivity failed:', fetchError);
        setConnectionStatus('error');
        toast.error(`Cannot reach ${clientUrl}`);
        return;
      }

      // Create a timeout promise (20 seconds - increased for slower connections)
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => {
          console.error('[DatabaseStatus] ⏰ Timeout reached after 20 seconds');
          reject(new Error('Connection check timed out'));
        }, 20000)
      );

      // Use a simpler health check that doesn't require data
      console.log('[DatabaseStatus] 🔍 Executing health check query...');

      // Try a simple query with explicit timeout handling
      const checkPromise = (async () => {
        try {
          console.log('[DatabaseStatus] 📡 Sending query to Supabase...');
          const startTime = Date.now();
          const result = await supabase
            .from('profiles')
            .select('count', { count: 'exact', head: true });
          const duration = Date.now() - startTime;
          console.log('[DatabaseStatus] 📬 Query completed in', duration, 'ms');
          console.log('[DatabaseStatus] 📦 Query result:', result);
          return result;
        } catch (queryError) {
          console.error('[DatabaseStatus] 💥 Query threw error:', queryError);
          throw queryError;
        }
      })();

      console.log('[DatabaseStatus] ⏳ Waiting for race between query and timeout...');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = (await Promise.race([checkPromise, timeoutPromise])) as any;
      console.log('[DatabaseStatus] ✅ Race completed, result:', result);
      const { error } = result;
      console.log('[DatabaseStatus] 📊 Error from query:', error);

      if (error) {
        console.error('[DatabaseStatus] ❌ Connection check failed:', error);
        console.error('[DatabaseStatus] Error code:', error.code);
        console.error('[DatabaseStatus] Error message:', error.message);
        console.error('[DatabaseStatus] Error details:', error.details);

        if (error.message?.includes('Invalid API key')) {
          console.log('[DatabaseStatus] Invalid API key detected');
          setConnectionStatus('error');
          toast.error(`Invalid API Key for ${clientUrl}. Check your .env file.`);
        } else if (error.code === 'PGRST301' || error.code === '42501') {
          // RLS error means we connected successfully!
          console.log('[DatabaseStatus] RLS error detected - connection successful!');
          setConnectionStatus('connected');
        } else {
          console.log('[DatabaseStatus] Other error - setting status to error');
          setConnectionStatus('error');
          // If it's a timeout, show a specific toast
          if (error.message === 'Connection check timed out') {
            toast.error(`Connection timed out connecting to ${clientUrl}`);
          }
        }
      } else {
        console.log('[DatabaseStatus] ✅ Connection successful!');
        setConnectionStatus('connected');
      }
    } catch (error) {
      console.error('[DatabaseStatus] Failed to check database status', error);
      setConnectionStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const togglePreference = () => {
    if (!hasLocalEnv) {
      toast.info('Local database configuration not found. Cannot switch to local.');
      return;
    }

    const newPref = isLocal ? 'remote' : 'local';
    // Set cookie for 1 year
    document.cookie = `sb-provider-preference=${newPref}; path=/; max-age=31536000`;

    toast.success(`Switched to ${newPref} database. Reloading...`);

    // Reload to apply changes
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const badge = (
    <Badge
      variant="outline"
      className={cn(
        'backdrop-blur-md shadow-lg cursor-pointer transition-all duration-300 hover:scale-105 px-3 py-1.5',
        connectionStatus === 'error'
          ? 'bg-destructive/10 border-destructive/50 text-destructive hover:bg-destructive/20'
          : isLocal
          ? 'bg-primary/10 border-primary/50 text-primary hover:bg-primary/20'
          : 'bg-warning/10 border-warning/50 text-warning hover:bg-warning/20',
        className
      )}
      onClick={togglePreference}
    >
      <div className="flex items-center gap-2">
        {loading ? (
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
        ) : connectionStatus === 'error' ? (
          <AlertCircle className="w-3.5 h-3.5" />
        ) : isLocal ? (
          <Laptop className="w-3.5 h-3.5" />
        ) : (
          <Server className="w-3.5 h-3.5" />
        )}
        <div className="flex flex-col items-start leading-none">
          <span className="font-medium text-xs">
            {loading ? 'Checking...' : isLocal ? 'Local DB' : 'Remote DB'}
          </span>
          {!loading && (
            <span className="text-[10px] opacity-80">
              {connectionStatus === 'error'
                ? 'Connection Failed'
                : isLocal
                ? 'localhost:54321'
                : 'supabase.co'}
            </span>
          )}
        </div>
      </div>
    </Badge>
  );

  if (variant === 'fixed') {
    return <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2">{badge}</div>;
  }

  return badge;
}

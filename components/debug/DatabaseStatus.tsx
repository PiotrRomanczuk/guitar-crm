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
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'error'>('unknown');

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setLoading(true);
    try {
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
      const supabase = createClient();
      
      // Get the URL from the client to display it
      // @ts-expect-error - accessing private property for debug
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const clientUrl = (supabase as any).supabaseUrl;
      console.log('[DatabaseStatus] Testing connection to:', clientUrl);

      const { error } = await supabase.from('profiles').select('count').limit(1).maybeSingle();
      
      if (error) {
        console.error('Database connection check failed:', error);
        // If it's an auth error (401), it might just be RLS, which means we ARE connected.
        // But "Invalid API key" is also 401/403.
        // Invalid API key usually comes with a specific message.
        if (error.message.includes('Invalid API key')) {
             setConnectionStatus('error');
             toast.error(`Invalid API Key for ${clientUrl}. Check your .env file.`);
        } else if (error.code === 'PGRST301' || error.code === '42501') {
            // RLS error means we connected successfully!
            setConnectionStatus('connected');
        } else {
            setConnectionStatus('error');
        }
      } else {
        setConnectionStatus('connected');
      }

    } catch (error) {
      console.error('Failed to check database status', error);
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
        "backdrop-blur-md shadow-lg cursor-pointer transition-all duration-300 hover:scale-105 px-3 py-1.5",
        connectionStatus === 'error' 
          ? 'bg-red-500/10 border-red-500/50 text-red-500 hover:bg-red-500/20'
          : isLocal 
              ? 'bg-blue-500/10 border-blue-500/50 text-blue-500 hover:bg-blue-500/20' 
              : 'bg-orange-500/10 border-orange-500/50 text-orange-500 hover:bg-orange-500/20',
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
                  {connectionStatus === 'error' ? 'Connection Failed' : isLocal ? 'localhost:54321' : 'supabase.co'}
                </span>
              )}
          </div>
      </div>
    </Badge>
  );

  if (variant === 'fixed') {
    return (
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2">
        {badge}
      </div>
    );
  }

  return badge;
}

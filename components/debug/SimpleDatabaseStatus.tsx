'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Server, Laptop } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SimpleDatabaseStatusProps {
  className?: string;
  variant?: 'fixed' | 'inline';
}

export function SimpleDatabaseStatus({ className, variant = 'fixed' }: SimpleDatabaseStatusProps) {
  const [isLocal, setIsLocal] = useState<boolean | null>(null);
  const [hasLocalEnv, setHasLocalEnv] = useState(false);

  useEffect(() => {
    // Check cookie preference
    const match = document.cookie.match(new RegExp('(^| )sb-provider-preference=([^;]+)'));
    const currentPref = match && match[2] === 'remote' ? 'remote' : 'local';

    // Check if local env vars exist - must use window check for client-side
    // These are embedded at build time by Next.js
    const localUrl =
      typeof window !== 'undefined'
        ? (window as any).NEXT_PUBLIC_SUPABASE_LOCAL_URL ||
          process.env.NEXT_PUBLIC_SUPABASE_LOCAL_URL
        : process.env.NEXT_PUBLIC_SUPABASE_LOCAL_URL;
    const hasLocal = !!localUrl;

    console.log('[SimpleDatabaseStatus] Local URL:', localUrl, 'Has local:', hasLocal);
    setHasLocalEnv(hasLocal);

    // Determine what we are actually connected to
    const actuallyLocal = currentPref === 'local' && hasLocal;
    setIsLocal(actuallyLocal);
  }, []);

  const toggleProvider = () => {
    if (!hasLocalEnv) {
      return; // Can't toggle if no local env
    }

    const newPref = isLocal ? 'remote' : 'local';
    document.cookie = `sb-provider-preference=${newPref}; path=/; max-age=31536000`;
    setIsLocal(!isLocal);

    // Reload to apply changes
    window.location.reload();
  };

  if (isLocal === null) {
    return null; // Not loaded yet
  }

  const baseClasses = cn(
    'flex items-center gap-2 bg-black/80 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-2 transition-all hover:bg-black/90',
    variant === 'fixed' && 'fixed top-4 right-4 z-50',
    className
  );

  return (
    <div className={baseClasses}>
      {isLocal ? (
        <>
          <Laptop className="w-4 h-4 text-blue-400" />
          <Badge variant="outline" className="border-blue-400/50 text-blue-400">
            Local DB
          </Badge>
        </>
      ) : (
        <>
          <Server className="w-4 h-4 text-green-400" />
          <Badge variant="outline" className="border-green-400/50 text-green-400">
            Remote DB
          </Badge>
        </>
      )}

      {hasLocalEnv && (
        <button
          onClick={toggleProvider}
          className="ml-2 text-xs text-gray-400 hover:text-white transition-colors"
          title="Switch database"
        >
          Switch
        </button>
      )}
    </div>
  );
}

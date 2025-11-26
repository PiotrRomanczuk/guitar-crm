'use client';

import { Badge } from '@/components/ui/badge';

export function ConnectionStatus() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isLocal = supabaseUrl?.includes('localhost') || supabaseUrl?.includes('127.0.0.1');

  return (
    <Badge
      variant="outline"
      className={`ml-2 hidden sm:inline-flex whitespace-nowrap ${
        isLocal
          ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800'
          : 'bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800'
      }`}
    >
      {isLocal ? 'Local DB' : 'Remote DB'}
    </Badge>
  );
}

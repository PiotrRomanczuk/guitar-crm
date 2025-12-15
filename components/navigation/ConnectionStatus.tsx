'use client';

import { DatabaseStatus } from '@/components/debug/DatabaseStatus';

export function ConnectionStatus() {
  return <DatabaseStatus variant="inline" className="ml-2 hidden sm:inline-flex" />;
}

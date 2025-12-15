import { createBrowserClient } from '@supabase/ssr';
import { getSupabaseConfig } from './config';

export function createClient() {
  let forceRemote = false;
  if (typeof document !== 'undefined') {
    const match = document.cookie.match(new RegExp('(^| )sb-provider-preference=([^;]+)'));
    if (match && match[2] === 'remote') {
      forceRemote = true;
    }
  }

  const { url, anonKey } = getSupabaseConfig({ forceRemote });
  return createBrowserClient(url, anonKey);
}

import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/database.types.generated';

let browserClient: ReturnType<typeof createBrowserClient<Database>> | null =
	null;

export function getSupabaseBrowserClient() {
	if (browserClient) {
		console.log('🔵 [Browser Client] Returning existing browser client');
		return browserClient;
	}

	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

	console.log('🔵 [Browser Client] Creating new browser client:', {
		hasUrl: !!supabaseUrl,
		hasKey: !!supabaseAnonKey,
		url: supabaseUrl,
	});

	if (!supabaseUrl || !supabaseAnonKey) {
		console.error('🔴 [Browser Client] Missing Supabase environment variables');
		throw new Error('Missing Supabase environment variables');
	}

	// Create a browser client with proper cookie-based session management using @supabase/ssr
	// This ensures compatibility with server-side SSR authentication
	browserClient = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
	console.log(
		'🟢 [Browser Client] Browser client created successfully using @supabase/ssr'
	);

	return browserClient;
}

/* eslint-disable max-lines-per-function */
'use client';

import {
	createContext,
	useContext,
	useEffect,
	useState,
	ReactNode,
} from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
	user: User | null;
	session: Session | null;
	loading: boolean;
	signOut: () => Promise<void>;
	isAdmin: boolean;
	isTeacher: boolean;
	isStudent: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [session, setSession] = useState<Session | null>(null);
	const [loading, setLoading] = useState(true);
	// Store role flags exactly as they exist in the DB (camelCase)
	const [profileRoles, setProfileRoles] = useState<{
		isAdmin: boolean;
		isTeacher: boolean;
		isStudent: boolean;
	} | null>(null);

	useEffect(() => {
		console.log('🔵 AuthProvider: Initializing...');
		const supabase = getSupabaseBrowserClient();
		console.log('🔵 AuthProvider: Supabase client created');

		let initialized = false;

		// Listen for auth changes FIRST (this handles initial session)
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			console.log('� Auth state changed:', {
				event: _event,
				hasSession: !!session,
				hasUser: !!session?.user,
				userId: session?.user?.id,
				email: session?.user?.email,
			});

			// Only update state if this is a real change or initial load
			if (!initialized || _event !== 'INITIAL_SESSION') {
				setSession(session);
				setUser(session?.user ?? null);
				setLoading(false);
				initialized = true;
			}
		});

		// Also try to get session directly (fallback)
		supabase.auth.getSession().then(({ data: { session } }) => {
			console.log('� getSession() result:', {
				hasSession: !!session,
				hasUser: !!session?.user,
				userId: session?.user?.id,
			});
			// Only set if not already initialized by onAuthStateChange
			if (!initialized && session) {
				setSession(session);
				setUser(session?.user ?? null);
				setLoading(false);
				initialized = true;
			}
		});

		return () => {
			console.log('🔵 AuthProvider: Cleaning up...');
			subscription.unsubscribe();
		};
	}, []);

	// Load role flags from profiles table (source of truth)
	useEffect(() => {
		const supabase = getSupabaseBrowserClient();
		let isMounted = true;

		const loadProfile = async () => {
			if (!user?.id) {
				console.log('🔴 No user ID, skipping profile load');
				setProfileRoles(null);
				return;
			}

			console.log('🔵 Loading profile for user:', user.id);

			const { data, error } = await supabase
				.from('profiles')
				.select('isAdmin,isTeacher,isStudent,user_id')
				.eq('user_id', user.id)
				.single();

			console.log('🟢 Profile query result:', {
				userId: user.id,
				data,
				error: error
					? { message: error.message, code: error.code, details: error.details }
					: null,
				roles: data
					? {
							isAdmin: (data as unknown as Record<string, boolean>).isAdmin,
							isTeacher: (data as unknown as Record<string, boolean>).isTeacher,
							isStudent: (data as unknown as Record<string, boolean>).isStudent,
					  }
					: null,
			});
			if (!isMounted) return;

			if (error) {
				console.warn(
					'🔴 Profile fetch failed, falling back to metadata:',
					error
				);
				setProfileRoles(null);
				return;
			}

			setProfileRoles({
				isAdmin: (data as unknown as Record<string, boolean>)?.isAdmin ?? false,
				isTeacher:
					(data as unknown as Record<string, boolean>)?.isTeacher ?? false,
				isStudent:
					(data as unknown as Record<string, boolean>)?.isStudent ?? false,
			});
		};

		loadProfile();
		return () => {
			isMounted = false;
		};
	}, [user?.id]);

	const signOut = async () => {
		const supabase = getSupabaseBrowserClient();
		await supabase.auth.signOut();
	};

	// Role checking helpers
	// Prefer roles from profiles table; fall back to user metadata if unavailable
	console.log('User metadata:', user?.user_metadata);
	console.log('Profile roles from DB:', profileRoles);

	const metaIsAdmin =
		user?.user_metadata?.isAdmin === true ||
		user?.user_metadata?.isAdmin === 'true';
	const metaIsTeacher =
		user?.user_metadata?.isTeacher === true ||
		user?.user_metadata?.isTeacher === 'true';
	const metaIsStudent =
		user?.user_metadata?.isStudent === true ||
		user?.user_metadata?.isStudent === 'true';

	const isAdmin = profileRoles?.isAdmin ?? metaIsAdmin ?? false;
	const isTeacher = profileRoles?.isTeacher ?? metaIsTeacher ?? false;
	const isStudent = profileRoles?.isStudent ?? metaIsStudent ?? false;

	console.log('Computed roles:', {
		isAdmin,
		isTeacher,
		isStudent,
		metaIsAdmin,
		metaIsTeacher,
		metaIsStudent,
	});

	const value = {
		user,
		session,
		loading,
		signOut,
		isAdmin,
		isTeacher,
		isStudent,
	};

	console.log('AuthContext value:', value);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
}

'use client';

import {
	createContext,
	useContext,
	useEffect,
	useState,
	ReactNode,
} from 'react';
import { supabase, type Profile } from '@/lib/supabase';
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
	const [profileRoles, setProfileRoles] = useState<Pick<
		Profile,
		'isAdmin' | 'isTeacher' | 'isStudent'
	> | null>(null);

	useEffect(() => {
		// Get initial session
		supabase.auth.getSession().then(({ data: { session } }) => {
			setSession(session);
			setUser(session?.user ?? null);
			setLoading(false);
		});

		// Listen for auth changes
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session);
			setUser(session?.user ?? null);
			setLoading(false);
		});

		return () => subscription.unsubscribe();
	}, []);

	// Load role flags from profiles table (source of truth)
	useEffect(() => {
		let isMounted = true;
		const loadProfile = async () => {
			if (!user?.id) {
				setProfileRoles(null);
				return;
			}
			const { data, error } = await supabase
				.from('profiles')
				.select('isAdmin,isTeacher,isStudent,user_id')
				.eq('user_id', user.id)
				.single();

			if (!isMounted) return;

			if (error) {
				// Fall back silently to user metadata if fetching profile fails due to RLS or network
				setProfileRoles(null);
				return;
			}

			setProfileRoles({
				isAdmin: data?.isAdmin ?? false,
				isTeacher: data?.isTeacher ?? false,
				isStudent: data?.isStudent ?? false,
			});
		};

		loadProfile();
		return () => {
			isMounted = false;
		};
	}, [user?.id]);

	const signOut = async () => {
		await supabase.auth.signOut();
	};

	// Role checking helpers
	// Prefer roles from profiles table; fall back to user metadata if unavailable
	const metaIsAdmin = user?.user_metadata?.isAdmin === true;
	const metaIsTeacher = user?.user_metadata?.isTeacher === true;
	const metaIsStudent = user?.user_metadata?.isStudent === true;

	const isAdmin = profileRoles?.isAdmin ?? metaIsAdmin ?? false;
	const isTeacher = profileRoles?.isTeacher ?? metaIsTeacher ?? false;
	const isStudent = profileRoles?.isStudent ?? metaIsStudent ?? false;

	const value = {
		user,
		session,
		loading,
		signOut,
		isAdmin,
		isTeacher,
		isStudent,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
}

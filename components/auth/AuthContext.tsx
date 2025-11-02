import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthState {
	user: User | null;
	isAdmin: boolean;
	isTeacher: boolean;
	isStudent: boolean;
	isLoading: boolean;
	error: Error | null;
}

interface AuthContextType extends AuthState {
	signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [authState, setAuthState] = useState<AuthState>({
		user: null,
		isAdmin: false,
		isTeacher: false,
		isStudent: false,
		isLoading: true,
		error: null,
	});

	useEffect(() => {
		// Get initial session
		supabase.auth.getSession().then(({ data: { session } }) => {
			if (session?.user) {
				void updateUserRoles(session.user);
			} else {
				setAuthState((prev) => ({ ...prev, isLoading: false }));
			}
		});

		// Listen for auth changes
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			if (session?.user) {
				void updateUserRoles(session.user);
			} else {
				setAuthState({
					user: null,
					isAdmin: false,
					isTeacher: false,
					isStudent: false,
					isLoading: false,
					error: null,
				});
			}
		});

		return () => {
			subscription.unsubscribe();
		};
	}, []);

	async function updateUserRoles(user: User) {
		try {
			const { data: profile, error } = await supabase
				.from('profiles')
				.select('is_admin, is_teacher, is_student')
				.eq('user_id', user.id)
				.single();

			if (error) throw error;

			setAuthState({
				user,
				isAdmin: profile.is_admin || false,
				isTeacher: profile.is_teacher || false,
				isStudent: profile.is_student || false,
				isLoading: false,
				error: null,
			});
		} catch (error) {
			setAuthState({
				user: null,
				isAdmin: false,
				isTeacher: false,
				isStudent: false,
				isLoading: false,
				error:
					error instanceof Error
						? error
						: new Error('Failed to fetch user roles'),
			});
		}
	}

	const signOut = async () => {
		await supabase.auth.signOut();
	};

	return (
		<AuthContext.Provider value={{ ...authState, signOut }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
}

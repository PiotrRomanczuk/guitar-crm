'use server';

import { createClient } from '@/lib/supabase/server';

export async function listIdentities() {
	const supabase = await createClient();
	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser();

	if (authError || !user) {
		return { error: 'Unauthorized' };
	}

	const identities = user.identities ?? [];

	return {
		success: true,
		identities: identities.map((i) => ({
			id: i.id,
			provider: i.provider,
			createdAt: i.created_at,
			lastSignInAt: i.last_sign_in_at,
		})),
	};
}

export async function unlinkIdentity(identityId: string) {
	const supabase = await createClient();
	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser();

	if (authError || !user) {
		return { error: 'Unauthorized' };
	}

	const identities = user.identities ?? [];

	if (identities.length <= 1) {
		return { error: 'Cannot remove your only sign-in method. Add another method first.' };
	}

	const identity = identities.find((i) => i.id === identityId);
	if (!identity) {
		return { error: 'Identity not found.' };
	}

	const { error } = await supabase.auth.unlinkIdentity(identity);

	if (error) {
		return { error: error.message };
	}

	return { success: true };
}

'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const DELETION_GRACE_PERIOD_DAYS = 30;

export async function requestEmailChange(newEmail: string) {
	const supabase = await createClient();
	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser();

	if (authError || !user) {
		return { error: 'Unauthorized' };
	}

	const { error } = await supabase.auth.updateUser({ email: newEmail });

	if (error) {
		if (error.message.includes('already registered')) {
			return { error: 'This email is already in use by another account.' };
		}
		return { error: error.message };
	}

	return { success: true, message: 'A confirmation email has been sent to your new address.' };
}

export async function requestAccountDeletion() {
	const supabase = await createClient();
	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser();

	if (authError || !user) {
		return { error: 'Unauthorized' };
	}

	const now = new Date();
	const scheduledFor = new Date(now.getTime() + DELETION_GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000);

	const adminClient = createAdminClient();
	const { error } = await adminClient
		.from('profiles')
		.update({
			deletion_requested_at: now.toISOString(),
			deletion_scheduled_for: scheduledFor.toISOString(),
		})
		.eq('id', user.id);

	if (error) {
		return { error: 'Failed to schedule account deletion.' };
	}

	return {
		success: true,
		scheduledFor: scheduledFor.toISOString(),
		message: `Your account is scheduled for deletion on ${scheduledFor.toLocaleDateString()}. You can cancel this at any time.`,
	};
}

export async function cancelAccountDeletion() {
	const supabase = await createClient();
	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser();

	if (authError || !user) {
		return { error: 'Unauthorized' };
	}

	const adminClient = createAdminClient();
	const { error } = await adminClient
		.from('profiles')
		.update({
			deletion_requested_at: null,
			deletion_scheduled_for: null,
		})
		.eq('id', user.id);

	if (error) {
		return { error: 'Failed to cancel account deletion.' };
	}

	return { success: true, message: 'Account deletion has been cancelled.' };
}

export async function updateLastSignIn(userId: string) {
	const adminClient = createAdminClient();
	await adminClient.rpc('increment_sign_in_count' as never, { p_user_id: userId } as never);
}

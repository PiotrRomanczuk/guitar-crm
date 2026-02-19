'use server';

import { createClient } from '@/lib/supabase/server';

export async function enrollMFA() {
	const supabase = await createClient();
	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser();

	if (authError || !user) {
		return { error: 'Unauthorized' };
	}

	const { data, error } = await supabase.auth.mfa.enroll({
		factorType: 'totp',
		friendlyName: 'Strummy Authenticator',
	});

	if (error) {
		return { error: error.message };
	}

	return {
		success: true,
		factorId: data.id,
		qrCode: data.totp.qr_code,
		secret: data.totp.secret,
		uri: data.totp.uri,
	};
}

export async function verifyMFAEnrollment(factorId: string, code: string) {
	const supabase = await createClient();
	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser();

	if (authError || !user) {
		return { error: 'Unauthorized' };
	}

	const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
		factorId,
	});

	if (challengeError) {
		return { error: challengeError.message };
	}

	const { error: verifyError } = await supabase.auth.mfa.verify({
		factorId,
		challengeId: challengeData.id,
		code,
	});

	if (verifyError) {
		return { error: 'Invalid verification code. Please try again.' };
	}

	return { success: true };
}

export async function challengeMFA(factorId: string) {
	const supabase = await createClient();

	const { data, error } = await supabase.auth.mfa.challenge({ factorId });

	if (error) {
		return { error: error.message };
	}

	return { success: true, challengeId: data.id };
}

export async function verifyMFA(factorId: string, challengeId: string, code: string) {
	const supabase = await createClient();

	const { error } = await supabase.auth.mfa.verify({
		factorId,
		challengeId,
		code,
	});

	if (error) {
		return { error: 'Invalid verification code. Please try again.' };
	}

	return { success: true };
}

export async function unenrollMFA(factorId: string) {
	const supabase = await createClient();
	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser();

	if (authError || !user) {
		return { error: 'Unauthorized' };
	}

	const { error } = await supabase.auth.mfa.unenroll({ factorId });

	if (error) {
		return { error: error.message };
	}

	return { success: true };
}

export async function listMFAFactors() {
	const supabase = await createClient();
	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser();

	if (authError || !user) {
		return { error: 'Unauthorized' };
	}

	const factors = user.factors ?? [];
	const verifiedFactors = factors.filter((f) => f.status === 'verified');

	return {
		success: true,
		factors: verifiedFactors.map((f) => ({
			id: f.id,
			friendlyName: f.friendly_name,
			factorType: f.factor_type,
			createdAt: f.created_at,
		})),
		hasMFA: verifiedFactors.length > 0,
	};
}

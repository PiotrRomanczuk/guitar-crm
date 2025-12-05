// Simple Supabase REST helpers for API-only Cypress tests
// Uses local dev env vars: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
// WARNING: Service role key is highly privileged. Only use in local dev/CI as configured.

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE';

function getConfig() {
	const url = (
		Cypress.env('NEXT_PUBLIC_SUPABASE_URL') ||
		Cypress.env('SUPABASE_URL') ||
		'http://127.0.0.1:54321'
	).toString();
	const serviceKey = (
		Cypress.env('SUPABASE_SERVICE_ROLE_KEY') || ''
	).toString();

	if (!serviceKey) {
		throw new Error(
			'SUPABASE_SERVICE_ROLE_KEY is required for API-only tests. Pass it via cypress.config.ts env or CYPRESS_SUPABASE_SERVICE_ROLE_KEY env var.'
		);
	}
	return { url, serviceKey };
}

export function restRequest<T = unknown>(
	method: Method,
	path: string,
	options: { qs?: Record<string, string>; body?: unknown } = {}
) {
	const { url, serviceKey } = getConfig();
	const headers = {
		apikey: serviceKey,
		Authorization: `Bearer ${serviceKey}`,
		'Content-Type': 'application/json',
		Prefer: 'return=representation',
	} as Record<string, string>;

	return cy.request<T>({
		method,
		url: `${url}/rest/v1${path}`,
		headers,
		qs: options.qs,
		body: options.body as Cypress.RequestBody,
		failOnStatusCode: false,
	});
}

type Profile = {
	user_id: string;
	email?: string;
	firstname?: string;
	lastname?: string;
};

export function getProfileByEmail(email: string) {
	return restRequest<Profile[]>('GET', '/profiles', {
		qs: { select: 'user_id,email,firstname,lastname', email: `eq.${email}` },
	}).then((resp) => {
		if (resp.status !== 200) {
			cy.log('Profile query failed:', resp.status, JSON.stringify(resp.body));
			throw new Error(
				`Profile query failed with status ${resp.status}: ${JSON.stringify(
					resp.body
				)}`
			);
		}
		expect(resp.body).to.be.an('array');
		const profile = resp.body[0];
		if (!profile || !profile.user_id) {
			throw new Error(`Profile not found for email: ${email}`);
		}
		return profile;
	});
}

export function authRequest<T = unknown>(
  method: Method,
  path: string,
  options: { body?: unknown } = {}
) {
  const { url, serviceKey } = getConfig();
  const headers = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    'Content-Type': 'application/json',
  };

  return cy.request<T>({
    method,
    url: `${url}/auth/v1${path}`,
    headers,
    body: options.body as Cypress.RequestBody,
    failOnStatusCode: false,
  });
}

export function createTestUser(email: string, password = 'password123', metadata = {}) {
  return authRequest<{ user: { id: string }; access_token: string }>('POST', '/admin/users', {
    body: {
      email,
      password,
      email_confirm: true,
      user_metadata: metadata,
    },
  }).then((resp) => {
    if (resp.status !== 200) {
      throw new Error(`Failed to create user: ${JSON.stringify(resp.body)}`);
    }
    return resp.body.user;
  });
}

export function deleteTestUser(userId: string) {
  return authRequest('DELETE', `/admin/users/${userId}`);
}

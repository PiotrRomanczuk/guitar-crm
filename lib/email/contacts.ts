import resend from './client';

export interface CreateContactParams {
  email: string;
  firstName?: string;
  lastName?: string;
  unsubscribed?: boolean;
  audienceId?: string;
}

export interface UpdateContactParams {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  unsubscribed?: boolean;
  audienceId?: string;
}

export interface GetContactParams {
  id?: string;
  email?: string;
  audienceId?: string;
}

export interface DeleteContactParams {
  id?: string;
  email?: string;
  audienceId?: string;
}

export interface ListContactsParams {
  audienceId?: string;
  limit?: number;
}

/**
 * Create a new contact
 * https://resend.com/docs/api-reference/contacts/create-contact
 */
export async function createContact(params: CreateContactParams) {
  try {
    const { audienceId, ...rest } = params;
    const payload = {
      ...rest,
      audienceId: audienceId || process.env.RESEND_AUDIENCE_ID,
    };

    if (!payload.audienceId) {
      // If no audience ID is provided, Resend might use a default or fail depending on configuration
      // But based on types, it is optional in the SDK but often required in practice if you have multiple audiences
      // We'll pass it if we have it.
    }

    const { data, error } = await resend.contacts.create(payload);

    if (error) {
      console.error('Error creating contact:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Exception creating contact:', error);
    return { success: false, error };
  }
}

/**
 * Get a contact by ID or Email
 * https://resend.com/docs/api-reference/contacts/get-contact
 */
export async function getContact(params: GetContactParams) {
  try {
    const { id, email, audienceId } = params;
    const audId = audienceId || process.env.RESEND_AUDIENCE_ID;

    let response;
    if (id) {
      response = await resend.contacts.get({ id, audienceId: audId });
    } else if (email) {
      response = await resend.contacts.get({ email, audienceId: audId });
    } else {
      throw new Error('Must provide either id or email');
    }

    const { data, error } = response;

    if (error) {
      console.error('Error getting contact:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Exception getting contact:', error);
    return { success: false, error };
  }
}

/**
 * Update a contact
 * https://resend.com/docs/api-reference/contacts/update-contact
 */
export async function updateContact(params: UpdateContactParams) {
  try {
    const { id, email, audienceId, ...updates } = params;
    const audId = audienceId || process.env.RESEND_AUDIENCE_ID;

    let response;
    if (id) {
      response = await resend.contacts.update({
        id,
        audienceId: audId,
        ...updates,
      });
    } else if (email) {
      response = await resend.contacts.update({
        email,
        audienceId: audId,
        ...updates,
      });
    } else {
      throw new Error('Must provide either id or email');
    }

    const { data, error } = response;

    if (error) {
      console.error('Error updating contact:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Exception updating contact:', error);
    return { success: false, error };
  }
}

/**
 * Delete a contact
 * https://resend.com/docs/api-reference/contacts/delete-contact
 */
export async function deleteContact(params: DeleteContactParams) {
  try {
    const { id, email, audienceId } = params;
    const audId = audienceId || process.env.RESEND_AUDIENCE_ID;

    let response;
    if (id) {
      response = await resend.contacts.remove({ id, audienceId: audId });
    } else if (email) {
      response = await resend.contacts.remove({ email, audienceId: audId });
    } else {
      throw new Error('Must provide either id or email');
    }

    const { data, error } = response;

    if (error) {
      console.error('Error deleting contact:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Exception deleting contact:', error);
    return { success: false, error };
  }
}

/**
 * List contacts
 * https://resend.com/docs/api-reference/contacts/list-contacts
 */
export async function listContacts(params: ListContactsParams = {}) {
  try {
    const { audienceId, limit } = params;
    const audId = audienceId || process.env.RESEND_AUDIENCE_ID;

    const { data, error } = await resend.contacts.list({
      audienceId: audId,
      // @ts-ignore - limit might not be in the type definition but is in the API
      limit,
    });

    if (error) {
      console.error('Error listing contacts:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Exception listing contacts:', error);
    return { success: false, error };
  }
}

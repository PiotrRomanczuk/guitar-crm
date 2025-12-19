'use server';

import { createClient } from '@/lib/supabase/server';
import {
  createContact,
  deleteContact,
  getContact,
  listContacts,
  updateContact,
  CreateContactParams,
} from '@/lib/email/contacts';
import { revalidatePath } from 'next/cache';

export async function getContactsAction() {
  try {
    const result = await listContacts();
    if (!result.success) {
      throw new Error(JSON.stringify(result.error));
    }
    return { success: true, data: result.data?.data || [] };
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return { success: false, error: 'Failed to fetch contacts' };
  }
}

export async function addContactAction(params: CreateContactParams) {
  try {
    const result = await createContact(params);
    if (!result.success) {
      throw new Error(JSON.stringify(result.error));
    }
    revalidatePath('/dashboard/contacts');
    return { success: true, data: result.data };
  } catch (error) {
    console.error('Error adding contact:', error);
    return { success: false, error: 'Failed to add contact' };
  }
}

export async function deleteContactAction(id: string) {
  try {
    const result = await deleteContact({ id });
    if (!result.success) {
      throw new Error(JSON.stringify(result.error));
    }
    revalidatePath('/dashboard/contacts');
    return { success: true };
  } catch (error) {
    console.error('Error deleting contact:', error);
    return { success: false, error: 'Failed to delete contact' };
  }
}

export async function syncStudentsAction() {
  try {
    const supabase = await createClient();

    // 1. Fetch all students from Supabase
    const { data: students, error: dbError } = await supabase
      .from('profiles')
      .select('email, full_name, id')
      .eq('is_student', true)
      .not('email', 'is', null);

    if (dbError) throw new Error(dbError.message);
    if (!students || students.length === 0) {
      return { success: true, message: 'No students found to sync', added: 0 };
    }

    // 2. Fetch all existing contacts from Resend
    const contactsResult = await listContacts();
    if (!contactsResult.success) throw new Error(JSON.stringify(contactsResult.error));
    
    const existingEmails = new Set(
      (contactsResult.data?.data || []).map((c: any) => c.email.toLowerCase())
    );

    // 3. Identify missing students
    const studentsToAdd = students.filter(
      (s) => s.email && !existingEmails.has(s.email.toLowerCase())
    );

    if (studentsToAdd.length === 0) {
      return { success: true, message: 'All students are already in contacts', added: 0 };
    }

    // 4. Add missing students
    let addedCount = 0;
    const errors = [];

    for (const student of studentsToAdd) {
      if (!student.email) continue;

      const nameParts = (student.full_name || '').split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const result = await createContact({
        email: student.email,
        firstName,
        lastName,
        unsubscribed: false,
      });

      if (result.success) {
        addedCount++;
      } else {
        errors.push({ email: student.email, error: result.error });
      }
    }

    revalidatePath('/dashboard/contacts');
    
    return {
      success: true,
      message: `Successfully synced ${addedCount} students`,
      added: addedCount,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    console.error('Error syncing students:', error);
    return { success: false, error: 'Failed to sync students' };
  }
}

'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { AssignmentTemplateInputSchema, AssignmentTemplateUpdateSchema } from '@/schemas';
import { z } from 'zod';

export async function createAssignmentTemplate(data: z.infer<typeof AssignmentTemplateInputSchema>) {
  const { isAdmin, isTeacher, user } = await getUserWithRolesSSR();

  if (!isAdmin && !isTeacher) {
    throw new Error('Unauthorized');
  }

  const result = AssignmentTemplateInputSchema.safeParse(data);
  if (!result.success) {
    throw new Error('Invalid data');
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from('assignment_templates')
    .insert({
      ...result.data,
      teacher_id: user.id, // Enforce teacher_id to be the current user
    });

  if (error) {
    console.error('Error creating assignment template:', error);
    throw new Error('Failed to create assignment template');
  }

  revalidatePath('/dashboard/assignments/templates');
}

export async function updateAssignmentTemplate(data: z.infer<typeof AssignmentTemplateUpdateSchema>) {
  const { isAdmin, isTeacher, user } = await getUserWithRolesSSR();

  if (!isAdmin && !isTeacher) {
    throw new Error('Unauthorized');
  }

  const result = AssignmentTemplateUpdateSchema.safeParse(data);
  if (!result.success) {
    throw new Error('Invalid data');
  }

  const supabase = await createClient();

  // Check ownership if not admin
  if (!isAdmin) {
    const { data: template } = await supabase
      .from('assignment_templates')
      .select('teacher_id')
      .eq('id', result.data.id)
      .single();
    
    if (!template || template.teacher_id !== user.id) {
      throw new Error('Unauthorized');
    }
  }

  const { error } = await supabase
    .from('assignment_templates')
    .update(result.data)
    .eq('id', result.data.id);

  if (error) {
    console.error('Error updating assignment template:', error);
    throw new Error('Failed to update assignment template');
  }

  revalidatePath('/dashboard/assignments/templates');
}

export async function deleteAssignmentTemplate(id: string) {
  const { isAdmin, isTeacher, user } = await getUserWithRolesSSR();

  if (!isAdmin && !isTeacher) {
    throw new Error('Unauthorized');
  }

  const supabase = await createClient();

  // Check ownership if not admin
  if (!isAdmin) {
    const { data: template } = await supabase
      .from('assignment_templates')
      .select('teacher_id')
      .eq('id', id)
      .single();
    
    if (!template || template.teacher_id !== user.id) {
      throw new Error('Unauthorized');
    }
  }

  const { error } = await supabase
    .from('assignment_templates')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting assignment template:', error);
    throw new Error('Failed to delete assignment template');
  }

  revalidatePath('/dashboard/assignments/templates');
}

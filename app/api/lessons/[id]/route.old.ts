import { createClient } from '@/utils/supabase/clients/server';
import { NextRequest, NextResponse } from 'next/server';
import {
	LessonWithProfilesSchema,
	LessonInputSchema,
	type LessonInput,
} from '@/schemas';

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const supabase = await createClient();

		// NOTE: Auth check temporarily removed - middleware disabled, relying on client-side protection
		// TODO: Implement proper cookie-based server auth when middleware is re-enabled

		const { data: lesson, error } = await supabase
			.from('lessons')
			.select(
				`
        *,
        profile:profiles!lessons_student_id_fkey(email, firstname, lastname),
        teacher_profile:profiles!lessons_teacher_id_fkey(email, firstname, lastname)
      `
			)
			.eq('id', id)
			.single();

		if (error) {
			console.error('Error fetching lesson:', error);
			// Check for PGRST116 error code (No rows returned)
			if (error.code === 'PGRST116') {
				return NextResponse.json(
					{ error: 'Lesson not found' },
					{ status: 404 }
				);
			}
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		if (!lesson) {
			return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
		}

		// Sanitize lesson object before validation
		function sanitizeLesson(raw: Record<string, unknown>) {
			const now = new Date().toISOString();
			return {
				...raw,
				lesson_teacher_number:
					typeof raw.lesson_teacher_number === 'number' &&
					raw.lesson_teacher_number > 0
						? raw.lesson_teacher_number
						: 1,
				title:
					typeof raw.title === 'string' && raw.title.trim().length > 0
						? raw.title
						: 'Untitled',
				notes: typeof raw.notes === 'string' ? raw.notes : '',
				date:
					typeof raw.date === 'string' &&
					!raw.date.startsWith('0000') &&
					!isNaN(Date.parse(raw.date))
						? new Date(raw.date).toISOString()
						: now,
				created_at:
					typeof raw.created_at === 'string' &&
					!raw.created_at.startsWith('0000') &&
					!isNaN(Date.parse(raw.created_at))
						? new Date(raw.created_at).toISOString()
						: now,
				updated_at:
					typeof raw.updated_at === 'string' &&
					!raw.updated_at.startsWith('0000') &&
					!isNaN(Date.parse(raw.updated_at))
						? new Date(raw.updated_at).toISOString()
						: now,
			};
		}
		try {
			const sanitizedLesson = sanitizeLesson(lesson);
			const validatedLesson = LessonWithProfilesSchema.parse(sanitizedLesson);
			return NextResponse.json(validatedLesson);
		} catch (validationError) {
			console.error('Lesson validation error:', validationError);
			return NextResponse.json(
				{ error: 'Invalid lesson data' },
				{ status: 500 }
			);
		}
	} catch (error) {
		console.error('Error in lesson API:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const supabase = await createClient();
		const body = await request.json();

		// NOTE: Auth check temporarily removed - middleware disabled, relying on client-side protection
		// TODO: Implement proper cookie-based server auth and role checks when middleware is re-enabled

		// Validate the update data
		let validatedData: Partial<LessonInput>;
		try {
			validatedData = LessonInputSchema.partial().parse(body);
		} catch (validationError) {
			console.error('Lesson update validation error:', validationError);
			return NextResponse.json(
				{ error: 'Invalid lesson update data', details: validationError },
				{ status: 400 }
			);
		}

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const { data: lesson, error } = await (supabase.from('lessons') as any)
			.update({
				title: validatedData.title,
				notes: validatedData.notes,
				date: validatedData.date,
				start_time: validatedData.start_time,
				status: validatedData.status,
			})
			.eq('id', id)
			.select()
			.single();

		if (error) {
			console.error('Error updating lesson:', error);
			// Check for PGRST116 error code (No rows returned)
			if (error.code === 'PGRST116') {
				return NextResponse.json(
					{ error: 'Lesson not found' },
					{ status: 404 }
				);
			}
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		// Validate the updated lesson
		try {
			const validatedLesson = LessonWithProfilesSchema.parse(lesson);
			return NextResponse.json(validatedLesson);
		} catch (validationError) {
			console.error('Updated lesson validation error:', validationError);
			return NextResponse.json(
				{ error: 'Invalid lesson data' },
				{ status: 500 }
			);
		}
	} catch (error) {
		console.error('Error in lesson update API:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const supabase = await createClient();

		// NOTE: Auth check temporarily removed - middleware disabled, relying on client-side protection
		// TODO: Implement proper cookie-based server auth and role checks when middleware is re-enabled

		const { error } = await supabase.from('lessons').delete().eq('id', id);

		if (error) {
			console.error('Error deleting lesson:', error);
			// Check for PGRST116 error code (No rows returned)
			if (error.code === 'PGRST116') {
				return NextResponse.json(
					{ error: 'Lesson not found' },
					{ status: 404 }
				);
			}
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error in lesson delete API:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}

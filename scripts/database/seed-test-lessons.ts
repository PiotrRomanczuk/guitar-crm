#!/usr/bin/env ts-node

/**
 * Seed Test Lessons
 * Creates test lessons for existing test users
 * Requires: Test users already created (admin, teacher, students)
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseServiceKey) {
	console.error('❌ NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY not set in .env.local');
	process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedTestLessons() {
	console.log('📚 Seeding test lessons...');
	console.log('===========================');

	try {
		// Get teacher and students
		const { data: profiles, error: profileError } = await supabase
			.from('profiles')
			.select('user_id, email, isteacher, isstudent, isadmin')
			.or('isteacher.eq.true,isstudent.eq.true');

		if (profileError || !profiles) {
			console.error('❌ Error fetching profiles:', profileError);
			process.exit(1);
		}

		const teacher = profiles.find((p) => p.isteacher);
		const students = profiles.filter((p) => p.isstudent);

		if (!teacher) {
			console.error('❌ No teacher found. Please run seed-dev-users first.');
			process.exit(1);
		}

		if (students.length === 0) {
			console.error('❌ No students found. Please run seed-dev-users first.');
			process.exit(1);
		}

		console.log(`✅ Found teacher: ${teacher.email}`);
		console.log(`✅ Found ${students.length} students`);

		// Check existing lessons
		const { data: existingLessons, error: checkError } = await supabase
			.from('lessons')
			.select('id');

		if (checkError) {
			console.error('❌ Error checking existing lessons:', checkError);
			process.exit(1);
		}

		console.log(`📊 Current lessons in database: ${existingLessons?.length || 0}`);

		// Clear existing test lessons if any
		if (existingLessons && existingLessons.length > 0) {
			console.log('🧹 Clearing existing lessons...');
			const { error: deleteError } = await supabase
				.from('lessons')
				.delete()
				.neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

			if (deleteError) {
				console.error('❌ Error clearing lessons:', deleteError);
				process.exit(1);
			}
			console.log('✅ Cleared existing lessons');
		}

		// Create lessons for each student
		const lessons = [];
		const today = new Date();

		for (const student of students) {
			// 2 completed lessons
			lessons.push({
				teacher_id: teacher.user_id,
				student_id: student.user_id,
				creator_user_id: teacher.user_id,
				status: 'COMPLETED',
				date: new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks ago
				notes: 'Covered basic chords and strumming patterns',
			});

			lessons.push({
				teacher_id: teacher.user_id,
				student_id: student.user_id,
				creator_user_id: teacher.user_id,
				status: 'COMPLETED',
				date: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
				notes: 'Practiced chord transitions and fingerpicking',
			});

			// 1 scheduled lesson (upcoming)
			lessons.push({
				teacher_id: teacher.user_id,
				student_id: student.user_id,
				creator_user_id: teacher.user_id,
				status: 'SCHEDULED',
				date: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
				notes: null,
			});
		}

		console.log(`\n🌱 Inserting ${lessons.length} test lessons...`);
		const { data: insertedLessons, error: insertError } = await supabase
			.from('lessons')
			.insert(lessons)
			.select();

		if (insertError) {
			console.error('❌ Error inserting lessons:', insertError);
			process.exit(1);
		}

		console.log(`✅ Successfully inserted ${insertedLessons?.length || 0} lessons`);

		// Display summary
		console.log('\n📊 Lessons Summary:');
		console.log('===================');

		const { data: stats } = await supabase
			.from('lessons')
			.select('status')
			.order('status');

		if (stats) {
			const completed = stats.filter((l) => l.status === 'COMPLETED').length;
			const scheduled = stats.filter((l) => l.status === 'SCHEDULED').length;
			const cancelled = stats.filter((l) => l.status === 'CANCELLED').length;
			const rescheduled = stats.filter((l) => l.status === 'RESCHEDULED').length;

			console.log(`Completed:   ${completed}`);
			console.log(`Scheduled:   ${scheduled}`);
			console.log(`Cancelled:   ${cancelled}`);
			console.log(`Rescheduled: ${rescheduled}`);
			console.log(`Total:       ${stats.length}`);
		}

		console.log('\n✅ Test lessons seeded successfully!');

		return insertedLessons;
	} catch (error) {
		console.error('❌ Unexpected error:', error);
		process.exit(1);
	}
}

// Run if called directly (ES module check)
if (import.meta.url === `file://${process.argv[1]}`) {
	seedTestLessons();
}

export { seedTestLessons };

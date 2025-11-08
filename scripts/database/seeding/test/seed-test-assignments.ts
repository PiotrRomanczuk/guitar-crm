#!/usr/bin/env ts-node

/**
 * Seed Test Assignments
 * Creates practice assignments for students from teachers
 * Requires: Test users (teachers and students) already created
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseServiceKey =
	process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY ||
	process.env.SUPABASE_SERVICE_ROLE_KEY ||
	'';

if (!supabaseServiceKey) {
	console.error('❌ NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY not set in .env.local');
	process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;
const STATUSES = ['OPEN', 'IN_PROGRESS', 'PENDING_REVIEW', 'COMPLETED', 'CANCELLED'] as const;

const ASSIGNMENT_TEMPLATES = [
	{
		title: 'Practice C Major Scale',
		description: 'Practice the C major scale for 15 minutes daily. Focus on clean finger transitions.',
		priority: 'MEDIUM',
	},
	{
		title: 'Learn Wonderwall Chords',
		description: 'Master the chord progression for Wonderwall: Em7, G, Dsus4, A7sus4. Practice chord changes.',
		priority: 'HIGH',
	},
	{
		title: 'Fingerpicking Exercise #1',
		description: 'Complete the Travis picking pattern exercise. Start slow and gradually increase tempo.',
		priority: 'MEDIUM',
	},
	{
		title: 'Memorize Hotel California Solo',
		description: 'Learn and memorize the main solo section. Break it into 4-bar segments.',
		priority: 'HIGH',
	},
	{
		title: 'Barre Chord Practice',
		description: 'Practice F and Bm barre chords. 10 minutes per chord, focus on clean sound.',
		priority: 'URGENT',
	},
	{
		title: 'Rhythm Training - 16th Notes',
		description: 'Practice 16th note strumming patterns with metronome. Start at 60 BPM.',
		priority: 'LOW',
	},
	{
		title: 'Learn Blackbird Introduction',
		description: 'Learn the intro picking pattern for Blackbird. Practice slowly with correct fingering.',
		priority: 'HIGH',
	},
	{
		title: 'Ear Training Exercise',
		description: 'Identify intervals by ear using the training app. Complete 3 sessions this week.',
		priority: 'LOW',
	},
	{
		title: 'Blues Scale in A',
		description: 'Memorize and practice the A minor pentatonic/blues scale across the neck.',
		priority: 'MEDIUM',
	},
	{
		title: 'Stairway to Heaven Intro',
		description: 'Learn the intro arpeggio section. Focus on timing and clarity.',
		priority: 'HIGH',
	},
];

async function seedTestAssignments() {
	console.log('📝 Seeding test assignments...');
	console.log('==============================');

	try {
		// Get teacher and students
		const { data: profiles, error: profileError } = await supabase
			.from('profiles')
			.select('id, email, is_teacher, is_student')
			.or('is_teacher.eq.true,is_student.eq.true');

		if (profileError || !profiles) {
			console.error('❌ Error fetching profiles:', profileError);
			process.exit(1);
		}

		const teacher = profiles.find((p) => p.is_teacher);
		const students = profiles.filter((p) => p.is_student);

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

		// Check existing assignments
		const { data: existingAssignments, error: checkError } = await supabase
			.from('assignments')
			.select('id');

		if (checkError) {
			console.error('❌ Error checking existing assignments:', checkError);
			process.exit(1);
		}

		console.log(`📊 Current assignments in database: ${existingAssignments?.length || 0}`);

		// Clear existing test assignments if any
		if (existingAssignments && existingAssignments.length > 0) {
			console.log('🧹 Clearing existing assignments...');
			const { error: deleteError } = await supabase
				.from('assignments')
				.delete()
				.neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

			if (deleteError) {
				console.error('❌ Error clearing assignments:', deleteError);
				process.exit(1);
			}
			console.log('✅ Cleared existing assignments');
		}

		// Create assignments for each student
		const assignments: Array<{
			user_id: string;
			title: string;
			description: string;
			priority: string;
			status: string;
			due_date: string | null;
		}> = [];
		const today = new Date();

		for (const student of students) {
			// Each student gets 4-6 assignments with varied statuses
			const numAssignments = 4 + Math.floor(Math.random() * 3); // 4-6 assignments
			const selectedTemplates = ASSIGNMENT_TEMPLATES.slice(0, numAssignments);

			selectedTemplates.forEach((template, index) => {
				let status: (typeof STATUSES)[number];
				let dueDate: Date | null;

				if (index === 0) {
					// First assignment - completed
					status = 'COMPLETED';
					dueDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000); // 1 week ago
				} else if (index === 1) {
					// Second assignment - in progress
					status = 'IN_PROGRESS';
					dueDate = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days from now
				} else if (index === 2) {
					// Third assignment - open with upcoming due date
					status = 'OPEN';
					dueDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000); // 1 week from now
				} else if (index === numAssignments - 1 && numAssignments > 4) {
					// Last assignment if there are many - cancelled
					status = 'CANCELLED';
					dueDate = null;
				} else {
					// Rest are open
					status = 'OPEN';
					dueDate = new Date(today.getTime() + (10 + index) * 24 * 60 * 60 * 1000);
				}

				assignments.push({
					user_id: student.id,
					title: template.title,
					description: template.description,
					priority: template.priority,
					status: status,
					due_date: dueDate?.toISOString() || null,
				});
			});
		}

		console.log(`\n🌱 Inserting ${assignments.length} test assignments...`);
		const { data: insertedAssignments, error: insertError } = await supabase
			.from('assignments')
			.insert(assignments)
			.select();

		if (insertError) {
			console.error('❌ Error inserting assignments:', insertError);
			process.exit(1);
		}

		console.log(`✅ Successfully inserted ${insertedAssignments?.length || 0} assignments`);

		// Display summary
		console.log('\n📊 Assignments Summary:');
		console.log('=======================');

		const { data: stats } = await supabase
			.from('assignments')
			.select('status, priority')
			.order('status');

		if (stats) {
			// Status distribution
			const statusCounts = STATUSES.reduce((acc, status) => {
				acc[status] = stats.filter((a) => a.status === status).length;
				return acc;
			}, {} as Record<string, number>);

			console.log('\nBy Status:');
			Object.entries(statusCounts).forEach(([status, count]) => {
				if (count > 0) console.log(`  ${status}: ${count}`);
			});

			// Priority distribution
			const priorityCounts = PRIORITIES.reduce((acc, priority) => {
				acc[priority] = stats.filter((a) => a.priority === priority).length;
				return acc;
			}, {} as Record<string, number>);

			console.log('\nBy Priority:');
			Object.entries(priorityCounts).forEach(([priority, count]) => {
				if (count > 0) console.log(`  ${priority}: ${count}`);
			});

			console.log(`\nTotal: ${stats.length}`);
		}

		console.log('\n✅ Test assignments seeded successfully!');

		return insertedAssignments;
	} catch (error) {
		console.error('❌ Unexpected error:', error);
		process.exit(1);
	}
}

// Run if called directly (ES module check)
if (import.meta.url === `file://${process.argv[1]}`) {
	seedTestAssignments();
}

export { seedTestAssignments };

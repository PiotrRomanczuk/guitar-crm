#!/usr/bin/env ts-node

/**
 * Seed Test Lesson-Songs
 * Creates associations between lessons and songs with progress statuses
 * Requires: Test lessons and songs already created
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseServiceKey) {
	console.error('❌ NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY not set in .env.local');
	process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const SONG_STATUSES = ['to_learn', 'started', 'remembered', 'with_author', 'mastered'] as const;

async function seedTestLessonSongs() {
	console.log('🎵 Seeding test lesson-songs...');
	console.log('=================================');

	try {
		// Get all lessons
		const { data: lessons, error: lessonError } = await supabase
			.from('lessons')
			.select('id, student_id, teacher_id, status')
			.order('created_at');

		if (lessonError || !lessons || lessons.length === 0) {
			console.error('❌ No lessons found. Please run seed-test-lessons first.');
			process.exit(1);
		}

		console.log(`✅ Found ${lessons.length} lessons`);

		// Get all songs
		const { data: songs, error: songError } = await supabase
			.from('songs')
			.select('id, title, level')
			.order('level', { ascending: true });

		if (songError || !songs || songs.length === 0) {
			console.error('❌ No songs found. Please run seed-test-songs first.');
			process.exit(1);
		}

		console.log(`✅ Found ${songs.length} songs`);

		// Check existing lesson-songs
		const { data: existingLessonSongs, error: checkError } = await supabase
			.from('lesson_songs')
			.select('lesson_id, song_id');

		if (checkError) {
			console.error('❌ Error checking existing lesson-songs:', checkError);
			process.exit(1);
		}

		console.log(`📊 Current lesson-song associations: ${existingLessonSongs?.length || 0}`);

		// Clear existing lesson-songs if any
		if (existingLessonSongs && existingLessonSongs.length > 0) {
			console.log('🧹 Clearing existing lesson-songs...');
			const { error: deleteError } = await supabase
				.from('lesson_songs')
				.delete()
				.neq('lesson_id', '00000000-0000-0000-0000-000000000000'); // Delete all

			if (deleteError) {
				console.error('❌ Error clearing lesson-songs:', deleteError);
				process.exit(1);
			}
			console.log('✅ Cleared existing lesson-songs');
		}

		// Create lesson-song associations
		const lessonSongs = [];
		const beginnerSongs = songs.filter((s) => s.level === 'beginner');
		const intermediateSongs = songs.filter((s) => s.level === 'intermediate');
		const advancedSongs = songs.filter((s) => s.level === 'advanced');

		for (let i = 0; i < lessons.length; i++) {
			const lesson = lessons[i];
			const isCompleted = lesson.status === 'COMPLETED';
			
			// Assign 2-3 songs per lesson
			const numSongs = Math.floor(Math.random() * 2) + 2; // 2 or 3 songs

			for (let j = 0; j < numSongs; j++) {
				// Pick appropriate songs based on lesson progression
				let selectedSong;
				const lessonIndex = i % 3; // Cycle through difficulty levels

				if (lessonIndex === 0 && beginnerSongs.length > j) {
					selectedSong = beginnerSongs[j];
				} else if (lessonIndex === 1 && intermediateSongs.length > j) {
					selectedSong = intermediateSongs[j];
				} else if (advancedSongs.length > j) {
					selectedSong = advancedSongs[j];
				} else {
					// Fallback to any available song
					selectedSong = songs[j % songs.length];
				}

				if (!selectedSong) continue;

				// Determine status based on lesson status
				let songStatus: (typeof SONG_STATUSES)[number];
				
				if (isCompleted) {
					// Completed lessons should have progressed songs
					const statusIndex = Math.min(j + 2, SONG_STATUSES.length - 1);
					songStatus = SONG_STATUSES[statusIndex];
				} else {
					// Scheduled lessons should have songs to learn or just started
					songStatus = j === 0 ? 'to_learn' : 'started';
				}

				lessonSongs.push({
					lesson_id: lesson.id,
					song_id: selectedSong.id,
					student_id: lesson.student_id,
					teacher_id: lesson.teacher_id,
					song_status: songStatus,
				});
			}
		}

		console.log(`\n🌱 Inserting ${lessonSongs.length} lesson-song associations...`);
		const { data: insertedLessonSongs, error: insertError } = await supabase
			.from('lesson_songs')
			.insert(lessonSongs)
			.select();

		if (insertError) {
			console.error('❌ Error inserting lesson-songs:', insertError);
			console.error('Details:', insertError);
			process.exit(1);
		}

		console.log(`✅ Successfully inserted ${insertedLessonSongs?.length || 0} lesson-song associations`);

		// Display summary
		console.log('\n📊 Lesson-Songs Summary:');
		console.log('========================');

		const { data: stats } = await supabase
			.from('lesson_songs')
			.select('song_status')
			.order('song_status');

		if (stats) {
			const statusCounts = SONG_STATUSES.reduce(
				(acc, status) => {
					acc[status] = stats.filter((ls) => ls.song_status === status).length;
					return acc;
				},
				{} as Record<string, number>
			);

			console.log(`To Learn:     ${statusCounts.to_learn || 0}`);
			console.log(`Started:      ${statusCounts.started || 0}`);
			console.log(`Remembered:   ${statusCounts.remembered || 0}`);
			console.log(`With Author:  ${statusCounts.with_author || 0}`);
			console.log(`Mastered:     ${statusCounts.mastered || 0}`);
			console.log(`Total:        ${stats.length}`);
		}

		console.log('\n✅ Test lesson-songs seeded successfully!');
	} catch (error) {
		console.error('❌ Unexpected error:', error);
		process.exit(1);
	}
}

// Run if called directly (ES module check)
if (import.meta.url === `file://${process.argv[1]}`) {
	seedTestLessonSongs();
}

export { seedTestLessonSongs };

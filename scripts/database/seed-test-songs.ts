#!/usr/bin/env ts-node

/**
 * Seed Test Songs
 * Creates a minimal set of songs for testing purposes (10-15 songs)
 * Distribution: beginner (5), intermediate (5), advanced (3)
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseServiceKey) {
	console.error('❌ NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY not set in .env.local');
	process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const testSongs = [
	// Beginner songs (5)
	{
		title: 'Wonderwall',
		author: 'Oasis',
		level: 'beginner',
		key: 'Em',
		chords: 'Em, G, D, A7sus4',
		ultimate_guitar_link: 'https://tabs.ultimate-guitar.com/tab/oasis/wonderwall-chords-64011',
	},
	{
		title: 'Knockin\' on Heaven\'s Door',
		author: 'Bob Dylan',
		level: 'beginner',
		key: 'G',
		chords: 'G, D, Am, C',
		ultimate_guitar_link: 'https://tabs.ultimate-guitar.com/tab/bob-dylan/knockin-on-heavens-door-chords-46792',
	},
	{
		title: 'Horse With No Name',
		author: 'America',
		level: 'beginner',
		key: 'Em',
		chords: 'Em, D6/9',
		ultimate_guitar_link: 'https://tabs.ultimate-guitar.com/tab/america/a-horse-with-no-name-chords-10513',
	},
	{
		title: 'Stand By Me',
		author: 'Ben E. King',
		level: 'beginner',
		key: 'A',
		chords: 'A, F#m, D, E',
		ultimate_guitar_link: 'https://tabs.ultimate-guitar.com/tab/ben-e-king/stand-by-me-chords-5789',
	},
	{
		title: 'Zombie',
		author: 'The Cranberries',
		level: 'beginner',
		key: 'Em',
		chords: 'Em, Cmaj7, G6, D/F#',
		ultimate_guitar_link: 'https://tabs.ultimate-guitar.com/tab/the-cranberries/zombie-chords-46025',
	},

	// Intermediate songs (5)
	{
		title: 'Hotel California',
		author: 'Eagles',
		level: 'intermediate',
		key: 'Bm',
		chords: 'Bm, F#, A, E, G, D, Em',
		ultimate_guitar_link: 'https://tabs.ultimate-guitar.com/tab/eagles/hotel-california-chords-8163',
	},
	{
		title: 'Tears in Heaven',
		author: 'Eric Clapton',
		level: 'intermediate',
		key: 'A',
		chords: 'A, E/G#, F#m, A/E, D/F#, E7sus4, E7',
		ultimate_guitar_link: 'https://tabs.ultimate-guitar.com/tab/eric-clapton/tears-in-heaven-chords-6234',
	},
	{
		title: 'Nothing Else Matters',
		author: 'Metallica',
		level: 'intermediate',
		key: 'Em',
		chords: 'Em, D, C, G, B7, Am',
		ultimate_guitar_link: 'https://tabs.ultimate-guitar.com/tab/metallica/nothing-else-matters-chords-8752',
	},
	{
		title: 'Blackbird',
		author: 'The Beatles',
		level: 'intermediate',
		key: 'G',
		chords: 'G, A7, C, D, Em, Cm',
		ultimate_guitar_link: 'https://tabs.ultimate-guitar.com/tab/the-beatles/blackbird-chords-9821',
	},
	{
		title: 'Under the Bridge',
		author: 'Red Hot Chili Peppers',
		level: 'intermediate',
		key: 'E',
		chords: 'E, B, C#m, A, G#m, F#',
		ultimate_guitar_link: 'https://tabs.ultimate-guitar.com/tab/red-hot-chili-peppers/under-the-bridge-chords-7845',
	},

	// Advanced songs (3)
	{
		title: 'Stairway to Heaven',
		author: 'Led Zeppelin',
		level: 'advanced',
		key: 'Am',
		chords: 'Am, G#, C/G, D/F#, Fmaj7, G, Am7, D, Dsus4, C, F, Am',
		ultimate_guitar_link: 'https://tabs.ultimate-guitar.com/tab/led-zeppelin/stairway-to-heaven-chords-3528',
	},
	{
		title: 'Little Wing',
		author: 'Jimi Hendrix',
		level: 'advanced',
		key: 'Em',
		chords: 'Em, G, Am, Bm, B♭, C, D, D#dim',
		ultimate_guitar_link: 'https://tabs.ultimate-guitar.com/tab/jimi-hendrix/little-wing-chords-4731',
	},
	{
		title: 'Classical Gas',
		author: 'Mason Williams',
		level: 'advanced',
		key: 'Am',
		chords: 'Am, G, F, E, Dm, C, B7',
		ultimate_guitar_link: 'https://tabs.ultimate-guitar.com/tab/mason-williams/classical-gas-chords-2341',
	},
];

async function seedTestSongs() {
	console.log('🎸 Seeding test songs...');
	console.log('=========================');

	try {
		// Check existing songs
		const { data: existingSongs, error: checkError } = await supabase
			.from('songs')
			.select('id, title, author');

		if (checkError) {
			console.error('❌ Error checking existing songs:', checkError);
			process.exit(1);
		}

		console.log(`📊 Current songs in database: ${existingSongs?.length || 0}`);

		// Clear existing test songs if any
		if (existingSongs && existingSongs.length > 0) {
			console.log('🧹 Clearing existing songs...');
			const { error: deleteError } = await supabase
				.from('songs')
				.delete()
				.neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

			if (deleteError) {
				console.error('❌ Error clearing songs:', deleteError);
				process.exit(1);
			}
			console.log('✅ Cleared existing songs');
		}

		// Insert test songs
		console.log(`\n🌱 Inserting ${testSongs.length} test songs...`);
		const { data: insertedSongs, error: insertError } = await supabase
			.from('songs')
			.insert(testSongs)
			.select();

		if (insertError) {
			console.error('❌ Error inserting songs:', insertError);
			process.exit(1);
		}

		console.log(`✅ Successfully inserted ${insertedSongs?.length || 0} songs`);

		// Display summary
		console.log('\n📊 Songs Summary:');
		console.log('==================');

		const { data: stats } = await supabase
			.from('songs')
			.select('level')
			.order('level');

		if (stats) {
			const beginner = stats.filter((s) => s.level === 'beginner').length;
			const intermediate = stats.filter((s) => s.level === 'intermediate').length;
			const advanced = stats.filter((s) => s.level === 'advanced').length;

			console.log(`Beginner:     ${beginner}`);
			console.log(`Intermediate: ${intermediate}`);
			console.log(`Advanced:     ${advanced}`);
			console.log(`Total:        ${stats.length}`);
		}

		console.log('\n✅ Test songs seeded successfully!');
	} catch (error) {
		console.error('❌ Unexpected error:', error);
		process.exit(1);
	}
}

// Run if called directly (ES module check)
if (import.meta.url === `file://${process.argv[1]}`) {
	seedTestSongs();
}

export { seedTestSongs };

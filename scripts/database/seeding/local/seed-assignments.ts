import { createClient } from '@supabase/supabase-js';
import { faker } from '@faker-js/faker';

// Supabase connection
const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321',
	process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU',
	{
		auth: {
			autoRefreshToken: false,
			persistSession: false,
		},
	}
);

// Assignment templates
const assignmentTemplates = {
	beginner: [
		{
			title: 'Basic Chord Practice',
			descriptions: [
				'Practice transitioning between open chords: A, D, and E',
				'Work on basic strumming patterns with G, C, and D chords',
				'Practice finger placement for Em and Am chords',
				'Focus on clean chord changes with basic progressions',
			],
			minMinutes: 20,
			maxMinutes: 45,
		},
		{
			title: 'Strumming Patterns',
			descriptions: [
				'Practice down-strums with 4/4 timing',
				'Work on alternating down and up strums',
				'Practice basic strumming pattern: Down, Down Up, Up Down Up',
				'Focus on keeping steady rhythm while strumming',
			],
			minMinutes: 15,
			maxMinutes: 30,
		},
	],
	intermediate: [
		{
			title: 'Fingerpicking Exercise',
			descriptions: [
				'Practice basic fingerpicking patterns',
				'Work on thumb independence in fingerpicking',
				'Practice alternating bass notes while fingerpicking',
				'Focus on Travis picking pattern',
			],
			minMinutes: 30,
			maxMinutes: 60,
		},
		{
			title: 'Barre Chord Practice',
			descriptions: [
				'Practice F barre chord transitions',
				'Work on barre chord progressions',
				'Practice moving barre shapes up the neck',
				'Focus on clean barre chord sound',
			],
			minMinutes: 25,
			maxMinutes: 50,
		},
	],
	advanced: [
		{
			title: 'Advanced Techniques',
			descriptions: [
				'Practice sweep picking exercises',
				'Work on tapping techniques',
				'Practice advanced chord voicings',
				'Focus on complex fingerstyle arrangements',
			],
			minMinutes: 45,
			maxMinutes: 90,
		},
		{
			title: 'Speed and Accuracy',
			descriptions: [
				'Practice scale runs with metronome',
				'Work on alternate picking exercises',
				'Practice complex chord progressions at tempo',
				'Focus on clean articulation at high speeds',
			],
			minMinutes: 40,
			maxMinutes: 75,
		},
	],
};

// Feedback templates
const feedbackTemplates = {
	positive: [
		'Great progress on the chord transitions!',
		'Your rhythm has improved significantly.',
		'Excellent work on keeping time with the metronome.',
		'The strumming pattern is much more consistent now.',
		'Your fingerpicking technique is developing well.',
	],
	constructive: [
		'Try to focus more on keeping steady tempo.',
		'Work on making chord changes smoother.',
		'Pay attention to muting unwanted string noise.',
		'Practice this section with a metronome.',
		'Remember to maintain proper finger positioning.',
	],
	needsWork: [
		'This section needs more practice at a slower tempo.',
		'Focus on clean chord transitions before increasing speed.',
		'The rhythm is not consistent yet - use a metronome.',
		'Work on finger independence in this section.',
		'The barre chords need more clarity - practice pressing evenly.',
	],
};

async function seedAssignments() {
	try {
		// Get existing lessons
		const { data: lessons, error: lessonsError } = await supabase
			.from('lessons')
			.select('id, teacher_id, student_id, date')
			.order('date', { ascending: true });

		if (lessonsError) throw lessonsError;
		if (!lessons || lessons.length === 0) {
			throw new Error('No lessons found in database');
		}
		console.log(`Found ${lessons.length} lessons`);

		// Get songs with their levels
		const { data: songs, error: songsError } = await supabase
			.from('songs')
			.select('id, level')
			.order('level');

		if (songsError) throw songsError;
		if (!songs || songs.length === 0) {
			throw new Error('No songs found in database');
		}
		console.log(`Found ${songs.length} songs`);

		// Create assignments for each lesson
		for (const lesson of lessons) {
			const songsByLevel = songs.filter((s) => s.level); // Group songs by level

			// Generate 1-3 assignments per lesson
			const assignmentCount = faker.number.int({ min: 1, max: 3 });

			for (let i = 0; i < assignmentCount; i++) {
				const randomSong = faker.helpers.arrayElement(songs);
				const level = randomSong.level || 'beginner';
				const template = faker.helpers.arrayElement(
					assignmentTemplates[level as keyof typeof assignmentTemplates]
				);

				// Calculate due date (3-14 days after lesson)
				const dueDate = new Date(lesson.date);
				dueDate.setDate(
					dueDate.getDate() + faker.number.int({ min: 3, max: 14 })
				);

				// Determine status based on due date
				const now = new Date();
				let status: string;
				let feedback: string | null = null;
				let reviewedAt: Date | null = null;

				if (dueDate < now) {
					// Past due date - either completed or overdue
					if (faker.number.int({ min: 1, max: 10 }) <= 8) {
						status = 'completed';
						// Generate feedback for completed assignments
						feedback = faker.helpers.arrayElement([
							...feedbackTemplates.positive,
							...feedbackTemplates.constructive,
						]);
						reviewedAt = faker.date.between({
							from: dueDate,
							to: new Date(),
						});
					} else {
						status = 'overdue';
					}
				} else {
					// Future due date - either not started or in progress
					status = faker.helpers.arrayElement(['not_started', 'in_progress']);
				}

				const assignment = {
					lesson_id: lesson.id,
					student_id: lesson.student_id,
					teacher_id: lesson.teacher_id,
					title: template.title,
					description: faker.helpers.arrayElement(template.descriptions),
					due_date: dueDate.toISOString(),
					status,
					feedback,
					reviewed_at: reviewedAt?.toISOString(),
					song_id: randomSong.id,
					practice_minutes: faker.number.int({
						min: template.minMinutes,
						max: template.maxMinutes,
					}),
					created_at: lesson.date,
					updated_at:
						status !== 'not_started'
							? faker.date
									.between({ from: lesson.date, to: dueDate })
									.toISOString()
							: null,
				};

				// Insert the assignment
				const { error: insertError } = await supabase
					.from('assignments')
					.upsert(assignment);

				if (insertError) {
					console.error('Error inserting assignment:', insertError);
					continue;
				}
			}
		}

		console.log('✅ Successfully seeded assignments');
	} catch (error) {
		console.error('Error seeding assignments:', error);
	}
}

// Run the seeding
seedAssignments();

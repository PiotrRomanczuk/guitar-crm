import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/navigation', () => ({
	useRouter() {
		return {
			push: jest.fn(),
			replace: jest.fn(),
			prefetch: jest.fn(),
			back: jest.fn(),
			forward: jest.fn(),
			refresh: jest.fn(),
		};
	},
	useSearchParams() {
		return new URLSearchParams();
	},
	usePathname() {
		return '/';
	},
}));

// Mock Supabase client
jest.mock('@/lib/supabase', () => ({
	supabase: {
		from: jest.fn(() => ({
			select: jest.fn().mockReturnThis(),
			insert: jest.fn().mockReturnThis(),
			update: jest.fn().mockReturnThis(),
			delete: jest.fn().mockReturnThis(),
			eq: jest.fn().mockReturnThis(),
			limit: jest.fn().mockReturnThis(),
			order: jest.fn().mockReturnThis(),
			single: jest.fn().mockReturnThis(),
		})),
		auth: {
			getUser: jest
				.fn()
				.mockResolvedValue({ data: { user: null }, error: null }),
			getSession: jest
				.fn()
				.mockResolvedValue({ data: { session: null }, error: null }),
			signIn: jest.fn(),
			signOut: jest.fn(),
			signUp: jest.fn(),
			onAuthStateChange: jest.fn(() => ({
				data: { subscription: { unsubscribe: jest.fn() } },
			})),
		},
	},
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
	writable: true,
	value: jest.fn().mockImplementation((query) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: jest.fn(), // Deprecated
		removeListener: jest.fn(), // Deprecated
		addEventListener: jest.fn(),
		removeEventListener: jest.fn(),
		dispatchEvent: jest.fn(),
	})),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
	constructor() {}
	disconnect() {}
	observe() {}
	unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
	constructor() {}
	disconnect() {}
	observe() {}
	unobserve() {}
};

// Global test utilities
global.testUtils = {
	// Helper to create mock user data
	createMockUser: (overrides = {}) => ({
		id: '1',
		email: 'test@example.com',
		firstName: 'Test',
		lastName: 'User',
		isAdmin: false,
		isTeacher: false,
		isStudent: true,
		isActive: true,
		canEdit: false,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
		...overrides,
	}),

	// Helper to create mock song data
	createMockSong: (overrides = {}) => ({
		id: '1',
		title: 'Test Song',
		author: 'Test Artist',
		level: 'beginner',
		key: 'C',
		chords: 'C G Am F',
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
		...overrides,
	}),

	// Helper to create mock lesson data
	createMockLesson: (overrides = {}) => ({
		id: '1',
		student_id: '1',
		teacher_id: '2',
		date: new Date().toISOString().split('T')[0],
		start_time: '10:00',
		status: 'SCHEDULED',
		title: 'Test Lesson',
		notes: 'Test notes',
		lesson_number: 1,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
		...overrides,
	}),
};

import { render, screen } from '@testing-library/react';
import { SessionInfo } from '../SessionInfo';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock Supabase client
const mockSelect = jest.fn();
const mockEq = jest.fn();
const mockSingle = jest.fn();

jest.mock('@/lib/supabase/client', () => ({
	createClient: jest.fn(() => ({
		from: jest.fn(() => ({
			select: mockSelect,
		})),
	})),
}));

function createWrapper() {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	return function Wrapper({ children }: { children: React.ReactNode }) {
		return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
	};
}

beforeEach(() => {
	jest.clearAllMocks();
	mockSelect.mockReturnValue({ eq: mockEq });
	mockEq.mockReturnValue({ single: mockSingle });
});

describe('SessionInfo', () => {
	it('should display session data when loaded', async () => {
		mockSingle.mockResolvedValue({
			data: { last_sign_in_at: '2025-01-15T10:30:00Z', sign_in_count: 42 },
			error: null,
		});

		render(<SessionInfo userId="user-123" />, { wrapper: createWrapper() });

		expect(await screen.findByText(/42/)).toBeInTheDocument();
		expect(screen.getByText(/Session Activity/)).toBeInTheDocument();
	});

	it('should show "Never" for null last_sign_in_at', async () => {
		mockSingle.mockResolvedValue({
			data: { last_sign_in_at: null, sign_in_count: 0 },
			error: null,
		});

		render(<SessionInfo userId="user-123" />, { wrapper: createWrapper() });

		expect(await screen.findByText(/Never/)).toBeInTheDocument();
		expect(screen.getByText(/0/)).toBeInTheDocument();
	});
});

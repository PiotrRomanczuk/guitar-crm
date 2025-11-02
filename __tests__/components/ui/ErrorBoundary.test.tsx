import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

// Component that throws an error
function ThrowError() {
	throw new Error('Test error');
}

// Component that works fine
function WorkingComponent() {
	return <div>Working content</div>;
}

describe('ErrorBoundary', () => {
	// Suppress console.error for these tests
	const originalError = console.error;
	beforeAll(() => {
		console.error = jest.fn();
	});

	afterAll(() => {
		console.error = originalError;
	});

	it('should render children when there is no error', () => {
		render(
			<ErrorBoundary>
				<WorkingComponent />
			</ErrorBoundary>
		);

		expect(screen.getByText('Working content')).toBeInTheDocument();
	});

	it('should render error UI when child component throws', () => {
		render(
			<ErrorBoundary>
				<ThrowError />
			</ErrorBoundary>
		);

		expect(screen.getByRole('alert')).toBeInTheDocument();
		expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
	});

	it('should display error message when provided', () => {
		render(
			<ErrorBoundary>
				<ThrowError />
			</ErrorBoundary>
		);

		expect(screen.getByText('Test error')).toBeInTheDocument();
	});

	it('should show try again button', () => {
		render(
			<ErrorBoundary>
				<ThrowError />
			</ErrorBoundary>
		);

		expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
	});

	it('should allow custom fallback component', () => {
		const CustomFallback = () => <div>Custom error message</div>;

		render(
			<ErrorBoundary fallback={<CustomFallback />}>
				<ThrowError />
			</ErrorBoundary>
		);

		expect(screen.getByText('Custom error message')).toBeInTheDocument();
	});
});

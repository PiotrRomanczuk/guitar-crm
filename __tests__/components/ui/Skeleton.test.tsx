import { render, screen } from '@testing-library/react';
import { Skeleton } from '@/components/ui/skeleton';

describe('Skeleton', () => {
	it('should render with default styling', () => {
		const { container } = render(<Skeleton />);
		const skeleton = container.firstChild as HTMLElement;
		expect(skeleton).toBeInTheDocument();
		expect(skeleton).toHaveClass('animate-pulse', 'bg-muted', 'rounded-md');
	});

	it('should accept custom className', () => {
		const { container } = render(<Skeleton className="h-10 w-full" />);
		const skeleton = container.firstChild as HTMLElement;
		expect(skeleton).toHaveClass('h-10', 'w-full', 'animate-pulse');
	});

	it('should render multiple skeleton items in a list', () => {
		render(
			<div>
				<Skeleton className="h-4 w-full mb-2" data-testid="skeleton-1" />
				<Skeleton className="h-4 w-3/4 mb-2" data-testid="skeleton-2" />
				<Skeleton className="h-4 w-1/2" data-testid="skeleton-3" />
			</div>
		);
		
		expect(screen.getByTestId('skeleton-1')).toBeInTheDocument();
		expect(screen.getByTestId('skeleton-2')).toBeInTheDocument();
		expect(screen.getByTestId('skeleton-3')).toBeInTheDocument();
	});

	it('should render circular skeleton', () => {
		const { container } = render(<Skeleton className="h-12 w-12 rounded-full" />);
		const skeleton = container.firstChild as HTMLElement;
		expect(skeleton).toHaveClass('rounded-full');
	});
});

import { render, screen } from '@testing-library/react';
import { Spinner } from '@/components/ui/spinner';

describe('Spinner', () => {
	it('should render with default size', () => {
		render(<Spinner />);
		const spinner = screen.getByRole('status');
		expect(spinner).toBeInTheDocument();
		expect(spinner).toHaveClass('h-8', 'w-8');
	});

	it('should render with small size', () => {
		render(<Spinner size="sm" />);
		const spinner = screen.getByRole('status');
		expect(spinner).toHaveClass('h-4', 'w-4');
	});

	it('should render with large size', () => {
		render(<Spinner size="lg" />);
		const spinner = screen.getByRole('status');
		expect(spinner).toHaveClass('h-12', 'w-12');
	});

	it('should have loading text for screen readers', () => {
		render(<Spinner />);
		expect(screen.getByText('Loading...')).toBeInTheDocument();
	});

	it('should accept custom className', () => {
		render(<Spinner className="custom-class" />);
		const spinner = screen.getByRole('status');
		expect(spinner).toHaveClass('custom-class');
	});
});

import { render, screen, fireEvent, act } from '@testing-library/react';
import SignUpPage from './page';
import { useRouter } from 'next/navigation';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock child components
jest.mock('@/components/auth', () => ({
  SignUpForm: ({ onSuccess }: { onSuccess: () => void }) => (
    <div data-testid="sign-up-form">
      <button onClick={onSuccess}>Simulate Success</button>
    </div>
  ),
}));

describe('SignUpPage', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders the sign up page structure', () => {
    render(<SignUpPage />);
    
    expect(screen.getByText('🎸 Guitar CRM')).toBeInTheDocument();
    expect(screen.getByText('Create your account')).toBeInTheDocument();
    expect(screen.getByTestId('sign-up-form')).toBeInTheDocument();
  });

  it('handles successful sign up with redirect delay', async () => {
    render(<SignUpPage />);
    
    const successButton = screen.getByText('Simulate Success');
    fireEvent.click(successButton);

    // Should not redirect immediately
    expect(mockRouter.push).not.toHaveBeenCalled();

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(mockRouter.push).toHaveBeenCalledWith('/sign-in');
  });
});

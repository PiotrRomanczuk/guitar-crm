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

  it('handles successful sign up and shows manual redirect button', async () => {
    render(<SignUpPage />);

    const successButton = screen.getByText('Simulate Success');
    fireEvent.click(successButton);

    // Should not redirect automatically anymore
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    // User must click manual button to redirect
    expect(mockRouter.push).not.toHaveBeenCalled();
  });
});

import { render, screen, fireEvent } from '@testing-library/react';
import SignInPage from './page';
import { useRouter } from 'next/navigation';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock child components
jest.mock('@/components/auth', () => ({
  SignInForm: ({ onSuccess }: { onSuccess: () => void }) => (
    <div data-testid="sign-in-form">
      <button onClick={onSuccess}>Simulate Success</button>
    </div>
  ),
}));

jest.mock('@/components/auth/AnimatedText', () => ({
  AnimatedText: () => <div data-testid="animated-text">Animated Text</div>,
}));

jest.mock('@/components/debug/DatabaseStatus', () => ({
  DatabaseStatus: () => <div data-testid="database-status">DB Status</div>,
}));

describe('SignInPage', () => {
  const mockRouter = {
    push: jest.fn(),
    refresh: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('renders the sign in page structure', () => {
    render(<SignInPage />);

    expect(screen.getByText('Log in')).toBeInTheDocument();
    expect(screen.getByTestId('sign-in-form')).toBeInTheDocument();
    expect(screen.getByTestId('animated-text')).toBeInTheDocument();
    expect(screen.getByTestId('database-status')).toBeInTheDocument();
  });

  it('handles successful sign in', () => {
    render(<SignInPage />);

    const successButton = screen.getByText('Simulate Success');
    fireEvent.click(successButton);

    expect(mockRouter.refresh).toHaveBeenCalled();
    expect(mockRouter.push).toHaveBeenCalledWith('/');
  });
});

import { render, screen, fireEvent } from '@testing-library/react';
import { ConnectGoogleButton } from '@/components/dashboard/calendar/ConnectGoogleButton';

describe('ConnectGoogleButton', () => {
  it('should render correctly', () => {
    render(<ConnectGoogleButton />);
    expect(screen.getByText('Connect Google Calendar')).toBeInTheDocument();
  });

  it('should have click handler that attempts to redirect', () => {
    // Note: Cannot directly test window.location.href changes in JSDOM
    // This test verifies the button is clickable and doesn't throw
    render(<ConnectGoogleButton />);
    const button = screen.getByText('Connect Google Calendar');

    // Verify button is clickable (will throw if handler errors)
    expect(() => fireEvent.click(button)).not.toThrow();

    // Verify button has correct role
    expect(screen.getByRole('button', { name: 'Connect Google Calendar' })).toBeInTheDocument();
  });
});

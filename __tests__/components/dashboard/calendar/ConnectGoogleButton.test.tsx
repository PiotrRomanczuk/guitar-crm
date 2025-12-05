import { render, screen, fireEvent } from '@testing-library/react';
import { ConnectGoogleButton } from '@/components/dashboard/calendar/ConnectGoogleButton';

// Mock window.location
const mockLocation = {
  href: '',
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

describe('ConnectGoogleButton', () => {
  it('should render correctly', () => {
    render(<ConnectGoogleButton />);
    expect(screen.getByText('Connect Google Calendar')).toBeInTheDocument();
  });

  it('should redirect to auth route on click', () => {
    render(<ConnectGoogleButton />);
    fireEvent.click(screen.getByText('Connect Google Calendar'));
    expect(window.location.href).toBe('/api/auth/google');
  });
});

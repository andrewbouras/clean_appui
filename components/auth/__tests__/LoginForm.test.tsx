import { render, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from '../LoginForm';
import { useAuth } from '@/lib/auth/AuthContext';

jest.mock('@/lib/auth/AuthContext');
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle Google login click', async () => {
    const { getByText } = render(<LoginForm />);
    
    const loginButton = getByText('Continue with Google');
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(window.location.href).toContain('/api/auth/google');
    });
  });

  it('should show error message when login fails', async () => {
    // Mock window.location to throw error
    const originalLocation = window.location;
    delete window.location;
    window.location = { ...originalLocation, href: '' };
    
    const { getByText } = render(<LoginForm />);
    
    const loginButton = getByText('Continue with Google');
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(getByText('Failed to initialize login. Please try again.')).toBeInTheDocument();
    });
  });
}); 
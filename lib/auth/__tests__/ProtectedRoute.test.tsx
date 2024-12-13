import { render, waitFor } from '@testing-library/react';
import { ProtectedRoute } from '../ProtectedRoute';
import { useAuth } from '../AuthContext';
import { useRouter } from 'next/navigation';

jest.mock('../AuthContext');
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

describe('ProtectedRoute', () => {
  const mockPush = jest.fn();
  const mockRouter = { push: mockPush };
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('should render children when authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      loading: false,
      user: { permissions: ['read'] }
    });

    const { getByText } = render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(getByText('Protected Content')).toBeInTheDocument();
  });

  it('should redirect to login when not authenticated', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      loading: false,
      user: null
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });
}); 
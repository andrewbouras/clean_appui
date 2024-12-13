import { render, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import { TokenService } from '../token';
import { api } from '../../api/client';

jest.mock('../token');
jest.mock('../../api/client');

describe('AuthContext', () => {
  const TestComponent = () => {
    const { isAuthenticated, user, loading } = useAuth();
    return (
      <div>
        <div data-testid="loading">{loading.toString()}</div>
        <div data-testid="authenticated">{isAuthenticated.toString()}</div>
        <div data-testid="user">{JSON.stringify(user)}</div>
      </div>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize auth state', async () => {
    (TokenService.isTokenValid as jest.Mock).mockReturnValue(true);
    (api.get as jest.Mock).mockResolvedValue({
      data: {
        user: { id: '1', email: 'test@example.com', permissions: ['read'] }
      }
    });

    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(getByTestId('loading')).toHaveTextContent('true');

    await waitFor(() => {
      expect(getByTestId('loading')).toHaveTextContent('false');
      expect(getByTestId('authenticated')).toHaveTextContent('true');
    });
  });
}); 
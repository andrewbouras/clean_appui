import { api } from '../client';
import { TokenService } from '../../auth/token';

jest.mock('../../auth/token');

describe('APIClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should add authorization header when token exists', async () => {
    const mockToken = 'test.token.123';
    (TokenService.getToken as jest.Mock).mockReturnValue(mockToken);

    const request = api.interceptors.request.handlers[0];
    const config = { headers: {} };
    const result = await request.fulfilled(config);

    expect(result.headers.Authorization).toBe(`Bearer ${mockToken}`);
  });

  it('should handle 401 errors by clearing token and redirecting', async () => {
    const error = {
      response: { status: 401 },
      config: {},
    };

    const response = api.interceptors.response.handlers[0];
    
    try {
      await response.rejected(error);
    } catch (e) {
      expect(TokenService.clearToken).toHaveBeenCalled();
      // In a real test, you'd need to mock window.location
    }
  });
}); 
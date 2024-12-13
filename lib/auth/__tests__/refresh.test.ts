import { TokenRefreshService } from '../refresh';
import { TokenService } from '../token';
import { api } from '../../api/client';

jest.mock('../token');
jest.mock('../../api/client');

describe('TokenRefreshService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should refresh token when needed', async () => {
    const newToken = 'new.test.token';
    (api.post as jest.Mock).mockResolvedValue({ data: { token: newToken } });
    
    const result = await TokenRefreshService.refreshToken();
    
    expect(result.token).toBe(newToken);
    expect(TokenService.setToken).toHaveBeenCalledWith(newToken);
  });

  it('should handle refresh failures', async () => {
    (api.post as jest.Mock).mockRejectedValue(new Error('Network error'));
    
    const result = await TokenRefreshService.refreshToken();
    
    expect(result.error).toBeDefined();
    expect(TokenService.clearToken).toHaveBeenCalled();
  });
}); 
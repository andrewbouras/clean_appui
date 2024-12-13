import { TokenService } from '../token';

describe('TokenService', () => {
  it('should handle token lifecycle', () => {
    const mockToken = 'your.mock.token';
    
    // Set token
    TokenService.setToken(mockToken);
    
    // Verify token is stored
    expect(TokenService.getToken()).toBe(mockToken);
    
    // Clear token
    TokenService.clearToken();
    
    // Verify token is removed
    expect(TokenService.getToken()).toBeNull();
  });
}); 
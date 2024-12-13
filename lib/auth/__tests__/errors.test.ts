import { AuthError, handleAuthError, AUTH_ERRORS } from '../errors';

describe('Auth Error Handling', () => {
  it('should handle token expired error', () => {
    const error = {
      response: { status: 401 }
    };

    const authError = handleAuthError(error);
    
    expect(authError).toBeInstanceOf(AuthError);
    expect(authError.code).toBe(AUTH_ERRORS.TOKEN_EXPIRED.code);
    expect(authError.action).toBe(AUTH_ERRORS.TOKEN_EXPIRED.action);
  });

  it('should handle permission denied error', () => {
    const error = {
      response: { status: 403 }
    };

    const authError = handleAuthError(error);
    
    expect(authError.code).toBe(AUTH_ERRORS.PERMISSION_DENIED.code);
    expect(authError.action).toBe(AUTH_ERRORS.PERMISSION_DENIED.action);
  });

  it('should handle unknown errors', () => {
    const error = new Error('Random error');
    
    const authError = handleAuthError(error);
    
    expect(authError.code).toBe('auth/unknown');
  });
}); 
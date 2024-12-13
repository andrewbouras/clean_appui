export class AuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public action?: string
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export const AUTH_ERRORS = {
  TOKEN_EXPIRED: {
    code: 'auth/token-expired',
    message: 'Your session has expired. Please log in again.',
    action: 'login'
  },
  INVALID_TOKEN: {
    code: 'auth/invalid-token',
    message: 'Invalid authentication. Please log in again.',
    action: 'login'
  },
  PERMISSION_DENIED: {
    code: 'auth/permission-denied',
    message: 'You don\'t have permission to access this resource.',
    action: 'request-access'
  },
  NETWORK_ERROR: {
    code: 'auth/network-error',
    message: 'Network error. Please check your connection and try again.',
    action: 'retry'
  }
} as const;

export function handleAuthError(error: unknown): AuthError {
  if (error instanceof AuthError) {
    return error;
  }

  // Handle axios errors
  if (error && typeof error === 'object' && 'response' in error) {
    const status = (error as any).response?.status;
    
    switch (status) {
      case 401:
        return new AuthError(
          AUTH_ERRORS.TOKEN_EXPIRED.message,
          AUTH_ERRORS.TOKEN_EXPIRED.code,
          AUTH_ERRORS.TOKEN_EXPIRED.action
        );
      case 403:
        return new AuthError(
          AUTH_ERRORS.PERMISSION_DENIED.message,
          AUTH_ERRORS.PERMISSION_DENIED.code,
          AUTH_ERRORS.PERMISSION_DENIED.action
        );
      default:
        return new AuthError(
          'An unexpected authentication error occurred.',
          'auth/unknown'
        );
    }
  }

  return new AuthError(
    'An unexpected error occurred.',
    'auth/unknown'
  );
} 
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthError } from '@/lib/auth/errors';
import { Button } from '@/components/ui/button';

interface AuthErrorProps {
  error: AuthError;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function AuthErrorDisplay({ 
  error, 
  onRetry, 
  onDismiss 
}: AuthErrorProps) {
  const router = useRouter();

  useEffect(() => {
    if (error.action === 'login') {
      // Store current path for post-login redirect
      sessionStorage.setItem('redirectUrl', window.location.pathname);
    }
  }, [error]);

  const handleAction = () => {
    switch (error.action) {
      case 'login':
        router.push('/login');
        break;
      case 'retry':
        onRetry?.();
        break;
      case 'request-access':
        router.push('/request-access');
        break;
      default:
        onDismiss?.();
    }
  };

  return (
    <div className="rounded-md bg-red-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          {/* Add error icon */}
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">
            {error.message}
          </h3>
          {error.action && (
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAction}
              >
                {error.action === 'retry' ? 'Try Again' : 
                  error.action === 'login' ? 'Log In' : 
                  'Request Access'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const baseUrl = window.location.hostname === 'localhost'
          ? 'http://localhost:3001'
          : 'https://notesfront-ha2ry34daa-uc.a.run.app';

        const response = await fetch(`${baseUrl}/auth/status`, {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Auth status:', data);
          setIsAuthenticated(true);
        } else {
          console.error('Auth check failed:', response.status);
          setIsAuthenticated(false);
          const currentPath = window.location.pathname;
          const redirectPath = currentPath === '/' ? '/login' : `/login?from=${encodeURIComponent(currentPath)}`;
          router.push(redirectPath);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
        const currentPath = window.location.pathname;
        const redirectPath = currentPath === '/' ? '/login' : `/login?from=${encodeURIComponent(currentPath)}`;
        router.push(redirectPath);
      }
    };

    checkAuth();
  }, [router]);

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
} 
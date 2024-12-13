'use client';

import { useAuth } from '@/lib/auth/AuthContext';
import { Button } from '@/components/ui/button';

export function LogoutButton() {
  const { logout } = useAuth();
  
  const handleLogout = async () => {
    try {
      await logout();
      // Additional cleanup if needed
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <Button 
      onClick={handleLogout}
      variant="outline"
    >
      Sign Out
    </Button>
  );
} 
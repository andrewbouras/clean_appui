'use client';

import { ProtectedRoute } from '@/lib/auth/ProtectedRoute';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div>
        <h1>Dashboard</h1>
        {/* Dashboard content */}
      </div>
    </ProtectedRoute>
  );
} 
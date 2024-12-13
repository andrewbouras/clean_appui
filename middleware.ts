import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { TokenService } from './lib/auth/token';

// Define protected routes and their required permissions
const PROTECTED_ROUTES = new Map([
  ['/dashboard', ['dashboard:read']],
  ['/questions', ['questions:read']],
  ['/admin', ['admin:access']],
  ['/profile', ['profile:read']]
]);

export async function middleware(request: NextRequest) {
  // Check if the route needs protection
  const path = request.nextUrl.pathname;
  const requiredPermissions = getRequiredPermissions(path);

  if (!requiredPermissions) {
    return NextResponse.next();
  }

  // Verify authentication
  const token = request.cookies.get('auth_token')?.value;
  if (!token || !TokenService.isTokenValid(token)) {
    return redirectToLogin(request);
  }

  // Verify permissions
  try {
    const decoded = TokenService.decodeToken(token);
    const hasPermissions = requiredPermissions.every(permission =>
      decoded.permissions.includes(permission)
    );

    if (!hasPermissions) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  } catch {
    return redirectToLogin(request);
  }

  return NextResponse.next();
}

function getRequiredPermissions(path: string): string[] | null {
  // Check exact matches
  if (PROTECTED_ROUTES.has(path)) {
    return PROTECTED_ROUTES.get(path)!;
  }

  // Check path patterns
  for (const [route, permissions] of PROTECTED_ROUTES.entries()) {
    if (path.startsWith(route)) {
      return permissions;
    }
  }

  return null;
}

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('from', request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/questions/:path*',
    '/admin/:path*',
    '/profile/:path*'
  ]
}; 
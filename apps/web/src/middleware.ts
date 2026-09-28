import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const publicPaths = ['/login', '/register', '/reset-password', '/api/auth', '/api/health'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (publicPaths.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next();
  }

  // Protect app routes (dashboard etc.) – Phase 5 will expand UI
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/settings')) {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET });
    if (!token) {
      const login = new URL('/login', req.url);
      login.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(login);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

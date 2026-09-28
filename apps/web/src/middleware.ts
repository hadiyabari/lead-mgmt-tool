import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const publicPaths = [
  '/',
  '/how-it-works',
  '/pricing',
  '/contact',
  '/login',
  '/register',
  '/reset-password',
  '/legal',
  '/api/auth',
  '/api/health',
  '/api/analytics',
  '/api/contact-sales',
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (publicPaths.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next();
  }

  if (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api/kill-switch') ||
    pathname.startsWith('/api/ledger') ||
    pathname.startsWith('/api/sources') ||
    pathname.startsWith('/api/leads') ||
    pathname.startsWith('/api/audit') ||
    pathname.startsWith('/api/admin')
  ) {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET });
    if (!token) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
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

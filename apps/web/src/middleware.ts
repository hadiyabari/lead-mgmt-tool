import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { applySecurityHeaders } from '@/lib/security-headers';

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
  '/api/replies/inbound',
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  let res: NextResponse;

  if (publicPaths.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    res = NextResponse.next();
    return applySecurityHeaders(res);
  }

  if (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api/kill-switch') ||
    pathname.startsWith('/api/ledger') ||
    pathname.startsWith('/api/workspace') ||
    pathname.startsWith('/api/sources') ||
    pathname.startsWith('/api/leads') ||
    pathname.startsWith('/api/audit') ||
    pathname.startsWith('/api/outbox') ||
    pathname.startsWith('/api/replies') ||
    pathname.startsWith('/api/meetings') ||
    pathname.startsWith('/api/campaigns') ||
    pathname.startsWith('/api/playbooks') ||
    pathname.startsWith('/api/sequences') ||
    pathname.startsWith('/api/icps') ||
    pathname.startsWith('/api/team') ||
    pathname.startsWith('/api/account') ||
    pathname.startsWith('/api/runs') ||
    pathname.startsWith('/api/costs') ||
    pathname.startsWith('/api/suppression') ||
    pathname.startsWith('/api/admin')
  ) {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET });
    if (!token) {
      if (pathname.startsWith('/api/')) {
        res = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        return applySecurityHeaders(res);
      }
      const login = new URL('/login', req.url);
      login.searchParams.set('callbackUrl', pathname);
      res = NextResponse.redirect(login);
      return applySecurityHeaders(res);
    }
  }

  res = NextResponse.next();
  return applySecurityHeaders(res);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

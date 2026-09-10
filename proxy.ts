import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isApiAuthRoute = nextUrl.pathname.startsWith('/api/auth');
  const isPublicRoute =
    nextUrl.pathname === '/login' || nextUrl.pathname === '/setup';
  const isApiRoute = nextUrl.pathname.startsWith('/api');

  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  if (isPublicRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL('/dashboard', nextUrl));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn && !isApiRoute) {
    return NextResponse.redirect(new URL('/login', nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

import { auth } from '@/auth';
import { NextResponse } from 'next/server';
 
export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnDashboard = req.nextUrl.pathname.startsWith('/farm') ||
                       req.nextUrl.pathname.startsWith('/advisor') ||
                       req.nextUrl.pathname.startsWith('/alerts') ||
                       req.nextUrl.pathname.startsWith('/profile') ||
                       req.nextUrl.pathname.startsWith('/dashboard');

  if (isOnDashboard && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};

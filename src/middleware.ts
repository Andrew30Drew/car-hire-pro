import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const isAdminPath = path.startsWith('/admin');
  const isDashboardPath = path.startsWith('/dashboard');

  if (isAdminPath || isDashboardPath) {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined');
      }
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);

      // Rule: If accessing /admin, user must be 'admin'
      if (isAdminPath && payload.role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      
      // If we are here, the user is authenticated. 
      // If asking for /admin, they are admin.
      // If asking for /dashboard, they are any role (user or admin), so allow.

    } catch (error) {
      // Token verification failed or expired
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
};

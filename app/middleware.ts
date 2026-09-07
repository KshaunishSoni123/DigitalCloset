import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const start = Date.now();
  const response = NextResponse.next();
  const duration = Date.now() - start;

  // Log the routing footprint
  console.log(JSON.stringify({
    level: 'HTTP',
    method: request.method,
    path: request.nextUrl.pathname,
    status: response.status,
    latencyMs: duration,
    timestamp: new Date().toISOString()
  }));

  return response;
}

// Only log actual API calls and page loads, skip static assets
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
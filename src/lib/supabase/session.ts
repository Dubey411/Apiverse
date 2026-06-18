import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Keep request cookies in sync (for downstream middleware)
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          // Propagate set-cookie headers to the response
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it hard
  // to debug issues with users being randomly logged out.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();
  const isDashboard = url.pathname.startsWith('/developer-dashboard');
  const isLogin = url.pathname.startsWith('/login');

  // Unauthenticated user trying to access protected routes → redirect to /login
  if (!user && isDashboard) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Authenticated user visiting /login → redirect to dashboard
  if (user && isLogin) {
    url.pathname = '/developer-dashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

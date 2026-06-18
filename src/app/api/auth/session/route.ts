import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({
      authenticated: false,
      user: null,
    });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email,
      avatar: user.user_metadata?.avatar_url ?? null,
      provider: user.app_metadata?.provider ?? 'unknown',
    },
  });
}

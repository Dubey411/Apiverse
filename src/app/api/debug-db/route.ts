import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  const admin = createAdminClient();
  const { data, error } = await admin.from('workspace_monitored_apis').select('*');
  return NextResponse.json({ count: data?.length, data, error });
}

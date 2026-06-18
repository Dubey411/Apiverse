import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const admin = createAdminClient();
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: adminData } = await admin.from('workspace_monitored_apis').select('*');
  const { data: userData, error: userError } = await supabase.from('workspace_monitored_apis').select('*');

  return NextResponse.json({
    user_id: user?.id,
    total_admin_apis: adminData?.length,
    total_user_apis: userData?.length,
    user_error: userError,
    admin_data_sample: adminData?.slice(0, 2)
  });
}

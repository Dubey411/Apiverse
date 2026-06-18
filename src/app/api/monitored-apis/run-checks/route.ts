import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { isSchemaMissingError, runMonitoringChecksForUser } from '@/lib/api-monitoring/service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const admin = createAdminClient();
    const result = await runMonitoringChecksForUser(admin, user.id);

    return NextResponse.json({
      result,
      message: result.checked === 0
        ? 'No APIs are registered for monitoring yet.'
        : `Monitoring completed for ${result.checked} API${result.checked === 1 ? '' : 's'}.`,
    });
  } catch (error) {
    const typedError = error as { code?: string; message?: string };
    const status = isSchemaMissingError(typedError) ? 500 : 400;

    return NextResponse.json({
      error: status === 500
        ? 'The monitored API tables are not in Supabase yet. Run the SQL migration first.'
        : error instanceof Error
          ? error.message
          : 'Unable to run monitoring checks.',
    }, { status });
  }
}

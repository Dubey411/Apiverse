import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { isSchemaMissingError, removeMonitoredApi, runMonitoringCheck } from '@/lib/api-monitoring/service';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const writeClient = createAdminClient();
    const result = await runMonitoringCheck(writeClient, user.id, id);
    return NextResponse.json({
      result,
      message: 'Monitoring check completed.',
    });
  } catch (error) {
    const status = isSchemaMissingError(error as { code?: string; message?: string }) ? 500 : 400;
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unable to run monitoring check.',
    }, { status });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const writeClient = createAdminClient();
    await removeMonitoredApi(writeClient, user.id, id);
    return NextResponse.json({ message: 'API removed.' });
  } catch (error) {
    const status = isSchemaMissingError(error as { code?: string; message?: string }) ? 500 : 400;
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unable to remove API.',
    }, { status });
  }
}

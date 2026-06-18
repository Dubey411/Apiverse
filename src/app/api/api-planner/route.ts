import { NextResponse } from 'next/server';
import { planApisForProject } from '@/lib/api-planner';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: Request) {
  let payload: Record<string, unknown>;

  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }

  const message = typeof payload.message === 'string' ? payload.message.trim() : '';
  if (!message) {
    return NextResponse.json({ error: 'Project description is required.' }, { status: 400 });
  }

  try {
    return NextResponse.json(await planApisForProject(message));
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unable to plan API bundle.',
    }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { recommendApisForQuestionAsync } from '@/lib/api-recommendations';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: Request) {
  let payload: Record<string, unknown>;

  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }

  const question = typeof payload.question === 'string' ? payload.question.trim() : '';
  const limit = typeof payload.limit === 'number' && Number.isFinite(payload.limit)
    ? Math.max(1, Math.min(12, Math.round(payload.limit)))
    : 6;

  if (!question) {
    return NextResponse.json({ error: 'Question is required.' }, { status: 400 });
  }

  return NextResponse.json({
    question,
    recommendations: await recommendApisForQuestionAsync(question, limit),
  });
}


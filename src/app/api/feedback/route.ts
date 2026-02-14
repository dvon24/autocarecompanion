import { NextRequest, NextResponse } from 'next/server';
import { appendFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

interface FeedbackPayload {
  type: 'bug' | 'feature' | 'general';
  message: string;
  email?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: FeedbackPayload = await request.json();

    if (!body.message || typeof body.message !== 'string' || !body.message.trim()) {
      return NextResponse.json(
        { error: 'Feedback message is required' },
        { status: 400 }
      );
    }

    const validTypes = ['bug', 'feature', 'general'];
    const type = validTypes.includes(body.type) ? body.type : 'general';

    // Store feedback to a local file
    // In production, this would go to a database or service like Slack/Discord
    const dataDir = join(process.cwd(), 'data');
    const filePath = join(dataDir, 'feedback.jsonl');

    if (!existsSync(dataDir)) {
      mkdirSync(dataDir, { recursive: true });
    }

    const feedbackEntry = {
      timestamp: new Date().toISOString(),
      type,
      message: body.message.trim(),
      email: body.email?.trim() || null,
      userAgent: request.headers.get('user-agent') || null,
    };

    appendFileSync(filePath, JSON.stringify(feedbackEntry) + '\n');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving feedback:', error);
    return NextResponse.json(
      { error: 'Failed to save feedback' },
      { status: 500 }
    );
  }
}

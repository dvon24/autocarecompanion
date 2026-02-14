import { NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export async function GET() {
  try {
    const dataDir = join(process.cwd(), 'data');
    const emails: { timestamp: string; email: string }[] = [];
    const feedback: { timestamp: string; type: string; message: string; email: string | null }[] = [];

    // Read interest emails
    const emailsFile = join(dataDir, 'interest-emails.txt');
    if (existsSync(emailsFile)) {
      const content = readFileSync(emailsFile, 'utf-8');
      const lines = content.trim().split('\n').filter(Boolean);
      for (const line of lines) {
        const [timestamp, email] = line.split(',');
        if (timestamp && email) {
          emails.push({ timestamp, email });
        }
      }
    }

    // Read feedback
    const feedbackFile = join(dataDir, 'feedback.jsonl');
    if (existsSync(feedbackFile)) {
      const content = readFileSync(feedbackFile, 'utf-8');
      const lines = content.trim().split('\n').filter(Boolean);
      for (const line of lines) {
        try {
          const entry = JSON.parse(line);
          feedback.push({
            timestamp: entry.timestamp,
            type: entry.type,
            message: entry.message,
            email: entry.email,
          });
        } catch {
          // Skip invalid lines
        }
      }
    }

    // Sort by most recent first
    emails.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    feedback.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({ emails, feedback });
  } catch (error) {
    console.error('Admin data error:', error);
    return NextResponse.json(
      { error: 'Failed to read data' },
      { status: 500 }
    );
  }
}

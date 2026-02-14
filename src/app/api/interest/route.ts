import { NextRequest, NextResponse } from 'next/server';
import { appendFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Store email to a local file for now
    // In production, this would go to a database
    const dataDir = join(process.cwd(), 'data');
    const filePath = join(dataDir, 'interest-emails.txt');

    if (!existsSync(dataDir)) {
      mkdirSync(dataDir, { recursive: true });
    }

    const timestamp = new Date().toISOString();
    appendFileSync(filePath, `${timestamp},${email}\n`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving interest email:', error);
    return NextResponse.json(
      { error: 'Failed to save email' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

interface VehicleFeedback {
  timestamp: string;
  userInput: string;
  aiParsed: {
    year: number;
    make: string;
    model: string;
    trim?: string;
    engine?: string;
  };
  userCorrection: string;
  userAgent?: string;
}

const FEEDBACK_FILE = path.join(process.cwd(), 'data', 'vehicle-feedback.json');

async function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

async function loadFeedback(): Promise<VehicleFeedback[]> {
  try {
    const data = await fs.readFile(FEEDBACK_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveFeedback(feedback: VehicleFeedback[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(FEEDBACK_FILE, JSON.stringify(feedback, null, 2));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userInput, aiParsed, userCorrection } = body;

    if (!userInput || !aiParsed || !userCorrection) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const feedback: VehicleFeedback = {
      timestamp: new Date().toISOString(),
      userInput,
      aiParsed,
      userCorrection,
      userAgent: request.headers.get('user-agent') || undefined,
    };

    const existing = await loadFeedback();
    existing.push(feedback);
    await saveFeedback(existing);

    console.log('[Vehicle Feedback] New correction submitted:', {
      input: userInput,
      parsed: `${aiParsed.year} ${aiParsed.make} ${aiParsed.model} ${aiParsed.trim || ''}`,
      correction: userCorrection,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Vehicle feedback error:', error);
    return NextResponse.json(
      { error: 'Failed to save feedback' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const feedback = await loadFeedback();
    return NextResponse.json({ feedback, count: feedback.length });
  } catch (error) {
    console.error('Vehicle feedback fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    );
  }
}

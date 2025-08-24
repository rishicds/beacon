import { NextRequest, NextResponse } from 'next/server';
import { analyzeEmailSecurity } from '@/ai/genkit';

export async function POST(req: NextRequest) {
  try {
    const { beaconLogs, accessLogs } = await req.json();
    // Debug: log input
    console.log('API /api/analyze-email input', { beaconLogsLength: beaconLogs?.length, accessLogsLength: accessLogs?.length });
    const shouldRevoke = await analyzeEmailSecurity({ beaconLogs, accessLogs });
    // Debug: log output
    console.log('API /api/analyze-email output', { shouldRevoke });
    return NextResponse.json({ shouldRevoke });
  } catch (e) {
    // Log the error for debugging
    console.error('AI analysis failed:', e);
    return NextResponse.json({ error: 'AI analysis failed', details: String(e) }, { status: 500 });
  }
}

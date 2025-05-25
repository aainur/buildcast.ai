import { NextResponse } from 'next/server';
import { validateEnvironment, getEnvironmentInfo } from '@/lib/env';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const envValidation = validateEnvironment();
    const envInfo = getEnvironmentInfo();
    
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: envInfo,
      validation: envValidation,
      apiRoutes: {
        health: 'working',
        generate: 'available at /api/generate',
        generateAudio: 'available at /api/generate-audio'
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 
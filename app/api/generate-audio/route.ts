import { NextRequest, NextResponse } from 'next/server';
import { generateAudioSummary } from '@/lib/tts';

// Configure for audio generation
export const runtime = 'nodejs';
export const maxDuration = 60; // Longer timeout for audio generation

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { success: false, error: 'No text content provided for audio generation' },
        { status: 400 }
      );
    }

    // Validate text length
    if (text.trim().length < 50) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Text content too short for audio generation (minimum 50 characters).'
        },
        { status: 400 }
      );
    }

    // Generate audio using ElevenLabs
    let audioResponse;
    try {
      audioResponse = await generateAudioSummary(text);
    } catch (error) {
      console.error('Audio generation error:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to generate audio. Please try again.'
        },
        { status: 500 }
      );
    }

    // Return the audio data
    return NextResponse.json({
      success: true,
      data: {
        audioUrl: audioResponse.audioUrl,
        transcript: audioResponse.transcript,
        downloadUrl: audioResponse.downloadUrl
      }
    });

  } catch (error) {
    console.error('Audio API route error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'An unexpected error occurred during audio generation. Please try again.'
      },
      { status: 500 }
    );
  }
} 
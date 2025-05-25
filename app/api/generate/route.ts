import { NextRequest, NextResponse } from 'next/server';
import { processWithClaude } from '@/lib/ai';
import { extractTextFromImage } from '@/lib/ocr';
import { getFileTypeCategory } from '@/lib/utils';
import { LearningContent } from '@/lib/types';

// Configure for file uploads
export const runtime = 'nodejs';
export const maxDuration = 30; // Reduced timeout since we're not doing audio

async function extractTextFromPDF(file: File): Promise<string> {
  try {
    // Dynamic import to avoid bundling issues
    const pdfParse = await import('pdf-parse');
    const buffer = await file.arrayBuffer();
    const data = await pdfParse.default(Buffer.from(buffer));
    return data.text;
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Failed to extract text from PDF. Please ensure the PDF contains readable text.');
  }
}

async function extractTextFromFile(file: File): Promise<string> {
  const fileType = getFileTypeCategory(file.type);
  
  switch (fileType) {
    case 'text':
      return await file.text();
      
    case 'pdf':
      return await extractTextFromPDF(file);
      
    case 'image':
      return await extractTextFromImage(file);
      
    default:
      throw new Error(`Unsupported file type: ${file.type}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse the form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    // Extract text from the file
    let extractedText: string;
    try {
      extractedText = await extractTextFromFile(file);
    } catch (error) {
      console.error('Text extraction error:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to extract text from file'
        },
        { status: 400 }
      );
    }

    // Validate extracted text
    if (!extractedText || extractedText.trim().length < 50) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Insufficient text content. Please provide a file with more readable text (minimum 50 characters).'
        },
        { status: 400 }
      );
    }

    // Process with Claude AI
    let claudeResponse;
    try {
      claudeResponse = await processWithClaude(extractedText);
    } catch (error) {
      console.error('Claude processing error:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to process content with AI'
        },
        { status: 500 }
      );
    }

    // Prepare the response WITHOUT audio (audio will be generated separately)
    const learningContent: LearningContent = {
      concepts: claudeResponse.concepts,
      summary: claudeResponse.summary, // Keep the lecture script for later audio generation
      flashcards: claudeResponse.flashcards,
      // No audioUrl or audioTranscript initially
    };

    return NextResponse.json({
      success: true,
      data: learningContent
    });

  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'An unexpected error occurred while processing your file. Please try again.'
      },
      { status: 500 }
    );
  }
} 
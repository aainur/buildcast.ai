import { createWorker } from 'tesseract.js';

export async function extractTextFromImage(imageFile: File): Promise<string> {
  try {
    const worker = await createWorker('eng');
    
    // Pass the File directly to Tesseract
    const { data: { text } } = await worker.recognize(imageFile);
    
    await worker.terminate();
    
    // Clean up the extracted text
    const cleanedText = text
      .replace(/\n\s*\n/g, '\n') // Remove multiple newlines
      .replace(/^\s+|\s+$/g, '') // Trim whitespace
      .replace(/\s+/g, ' '); // Normalize spaces
    
    if (!cleanedText || cleanedText.length < 10) {
      throw new Error('Could not extract meaningful text from the image. Please ensure the image contains clear, readable text.');
    }
    
    return cleanedText;
    
  } catch (error) {
    console.error('OCR processing error:', error);
    
    if (error instanceof Error) {
      throw new Error(`OCR failed: ${error.message}`);
    }
    
    throw new Error('Failed to extract text from image. Please try with a clearer image.');
  }
}

export async function validateImageForOCR(file: File): Promise<boolean> {
  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (!validTypes.includes(file.type)) {
    return false;
  }
  
  // Check file size (max 5MB for OCR)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return false;
  }
  
  return true;
}

export function getOCRSupportedFormats(): string[] {
  return ['image/jpeg', 'image/jpg', 'image/png'];
} 
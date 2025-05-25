export interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

export interface LearningContent {
  concepts: string[];
  summary: string;
  flashcards: Flashcard[];
  audioUrl?: string;
  audioTranscript?: string;
}

export interface ProcessingStatus {
  stage: 'idle' | 'processing' | 'complete' | 'error';
  message: string;
  progress: number;
}

export interface FileUploadData {
  file: File;
  type: 'text' | 'pdf' | 'image';
  content?: string;
}

export interface ClaudeResponse {
  concepts: string[];
  summary: string;
  flashcards: Flashcard[];
}

export interface APIResponse {
  success: boolean;
  data?: LearningContent;
  error?: string;
}

export interface UploadState {
  file: File | null;
  content: string;
  isProcessing: boolean;
  status: ProcessingStatus;
  results: LearningContent | null;
  error: string | null;
}

export type SupportedFileType = 'text/plain' | 'application/pdf' | 'image/jpeg' | 'image/png' | 'image/jpg';

export const SUPPORTED_FILE_TYPES: SupportedFileType[] = [
  'text/plain',
  'application/pdf', 
  'image/jpeg',
  'image/png',
  'image/jpg'
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB 
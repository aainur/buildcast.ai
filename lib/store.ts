import { create } from 'zustand';
import { UploadState, LearningContent, ProcessingStatus } from './types';

interface AppStore extends UploadState {
  // Actions
  setFile: (file: File | null) => void;
  setContent: (content: string) => void;
  setProcessing: (isProcessing: boolean) => void;
  setStatus: (status: ProcessingStatus) => void;
  setResults: (results: LearningContent | null) => void;
  setError: (error: string | null) => void;
  reset: () => void;
  
  // UI State
  currentFlashcardIndex: number;
  setCurrentFlashcardIndex: (index: number) => void;
  
  // Audio State
  isAudioPlaying: boolean;
  setIsAudioPlaying: (playing: boolean) => void;
  
  // Audio Generation State
  isGeneratingAudio: boolean;
  audioGenerationError: string | null;
  setGeneratingAudio: (generating: boolean) => void;
  setAudioGenerationError: (error: string | null) => void;
  setAudioData: (audioUrl: string, transcript: string) => void;
}

const initialState: UploadState = {
  file: null,
  content: '',
  isProcessing: false,
  status: {
    stage: 'idle',
    message: '',
    progress: 0
  },
  results: null,
  error: null
};

export const useAppStore = create<AppStore>((set, get) => ({
  ...initialState,
  currentFlashcardIndex: 0,
  isAudioPlaying: false,
  
  // Audio generation state
  isGeneratingAudio: false,
  audioGenerationError: null,
  
  setFile: (file) => set({ file }),
  setContent: (content) => set({ content }),
  setProcessing: (isProcessing) => set({ isProcessing }),
  setStatus: (status) => set({ status }),
  setResults: (results) => set({ results }),
  setError: (error) => set({ error }),
  
  setCurrentFlashcardIndex: (index) => set({ currentFlashcardIndex: index }),
  setIsAudioPlaying: (playing) => set({ isAudioPlaying: playing }),
  
  // Audio generation actions
  setGeneratingAudio: (generating) => set({ isGeneratingAudio: generating }),
  setAudioGenerationError: (error) => set({ audioGenerationError: error }),
  
  setAudioData: (audioUrl, transcript) => {
    const currentResults = get().results;
    if (currentResults) {
      set({ 
        results: {
          ...currentResults,
          audioUrl,
          audioTranscript: transcript
        }
      });
    }
  },
  
  reset: () => set({
    ...initialState,
    currentFlashcardIndex: 0,
    isAudioPlaying: false,
    isGeneratingAudio: false,
    audioGenerationError: null
  })
})); 
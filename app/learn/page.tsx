'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Play, Pause, Download, Volume2, RotateCcw, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppStore } from '@/lib/store';

// Helper function to convert base64 data URL to blob URL
function convertBase64ToBlob(base64DataUrl: string): string {
  try {
    // Check if it's already a blob URL or regular URL
    if (base64DataUrl.startsWith('blob:') || base64DataUrl.startsWith('http')) {
      return base64DataUrl;
    }
    
    // Validate data URL format
    if (!base64DataUrl.startsWith('data:audio/mpeg;base64,')) {
      console.error('Invalid audio data URL format:', base64DataUrl.substring(0, 50) + '...');
      return base64DataUrl;
    }
    
    // Extract the base64 part from data:audio/mpeg;base64,xxxxx
    const base64Part = base64DataUrl.split(',')[1];
    if (!base64Part) {
      console.error('No base64 data found in URL');
      return base64DataUrl;
    }
    
    // Validate base64 string
    try {
      // Test if base64 is valid by attempting to decode a small part
      atob(base64Part.substring(0, Math.min(100, base64Part.length)));
    } catch (testError) {
      console.error('Invalid base64 data detected:', testError);
      return base64DataUrl; // Return original for fallback
    }
    
    // Convert base64 to binary
    const binaryString = atob(base64Part);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Create blob and object URL
    const blob = new Blob([bytes], { type: 'audio/mpeg' });
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Error converting base64 to blob:', error);
    return base64DataUrl; // Fallback to original
  }
}

export default function LearnPage() {
  const router = useRouter();
  const { 
    results, 
    currentFlashcardIndex, 
    isAudioPlaying,
    isGeneratingAudio,
    audioGenerationError,
    setCurrentFlashcardIndex, 
    setIsAudioPlaying,
    setGeneratingAudio,
    setAudioGenerationError,
    setAudioData,
    reset 
  } = useAppStore();

  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if no results
    if (!results) {
      router.push('/');
      return;
    }

    // Convert base64 audio to blob URL when audio is available
    if (results.audioUrl && !audioBlobUrl) {
      const blobUrl = convertBase64ToBlob(results.audioUrl);
      setAudioBlobUrl(blobUrl);
      
      // Initialize audio element with blob URL
      const audio = new Audio(blobUrl);
      audio.addEventListener('ended', () => setIsAudioPlaying(false));
      audio.addEventListener('pause', () => setIsAudioPlaying(false));
      audio.addEventListener('play', () => setIsAudioPlaying(true));
      audio.addEventListener('error', (e) => {
        console.error('Audio playback error:', e);
      });
      setAudioElement(audio);
    }

    return () => {
      if (audioElement) {
        audioElement.pause();
      }
      // Clean up blob URLs to prevent memory leaks
      if (audioBlobUrl) {
        URL.revokeObjectURL(audioBlobUrl);
      }
    };
  }, [results, router, audioElement, audioBlobUrl, setIsAudioPlaying]);

  if (!results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-4">No learning content found</p>
          <Button onClick={() => router.push('/')}>
            Go Back to Upload
          </Button>
        </div>
      </div>
    );
  }

  const handleGenerateAudio = async () => {
    if (!results?.summary || isGeneratingAudio) return;

    setGeneratingAudio(true);
    setAudioGenerationError(null);

    try {
      const response = await fetch('/api/generate-audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: results.summary
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Audio generation failed');
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Audio generation failed');
      }

      // Update the store with audio data
      setAudioData(result.data.audioUrl, result.data.transcript);

    } catch (error) {
      console.error('Audio generation error:', error);
      let errorMessage = 'Failed to generate audio';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setAudioGenerationError(errorMessage);
    } finally {
      setGeneratingAudio(false);
    }
  };

  const handleAudioToggle = () => {
    if (!audioElement) return;

    if (isAudioPlaying) {
      audioElement.pause();
    } else {
      audioElement.play();
    }
  };

  const handleDownloadAudio = () => {
    if (audioBlobUrl) {
      // Use the blob URL for download
      const link = document.createElement('a');
      link.href = audioBlobUrl;
      link.download = 'buildcast-lecture.mp3';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleFlashcardFlip = (index: number) => {
    const newFlipped = new Set(flippedCards);
    if (newFlipped.has(index)) {
      newFlipped.delete(index);
    } else {
      newFlipped.add(index);
    }
    setFlippedCards(newFlipped);
  };

  const handlePreviousCard = () => {
    if (currentFlashcardIndex > 0) {
      setCurrentFlashcardIndex(currentFlashcardIndex - 1);
    }
  };

  const handleNextCard = () => {
    if (currentFlashcardIndex < results.flashcards.length - 1) {
      setCurrentFlashcardIndex(currentFlashcardIndex + 1);
    }
  };

  const handleStartOver = () => {
    reset();
    router.push('/');
  };

  const currentCard = results.flashcards[currentFlashcardIndex];
  const isCurrentCardFlipped = flippedCards.has(currentFlashcardIndex);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="outline"
            onClick={() => router.push('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Upload
          </Button>
          <Button
            variant="outline"
            onClick={handleStartOver}
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Start Over
          </Button>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Title */}
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Your Learning Content
            </h1>
            <p className="text-lg text-gray-600">
              AI-generated concepts, summary, and flashcards from your material
            </p>
          </div>

          {/* Key Concepts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </span>
                Key Concepts
              </CardTitle>
              <CardDescription>
                Main ideas extracted from your material
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-3">
                {results.concepts.map((concept, index) => (
                  <div
                    key={index}
                    className="p-3 bg-blue-50 rounded-lg border border-blue-200"
                  >
                    <p className="text-blue-800 font-medium">{concept}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Audio Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </span>
                Audio Summary
              </CardTitle>
              <CardDescription>
                Listen to an AI-generated summary of the key points
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-800 leading-relaxed">{results.summary}</p>
                </div>
                
                {!results.audioUrl ? (
                  <div className="space-y-4">
                    {audioGenerationError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-800 text-sm">{audioGenerationError}</p>
                      </div>
                    )}
                    
                    <Button
                      onClick={handleGenerateAudio}
                      disabled={isGeneratingAudio}
                      className="flex items-center gap-2"
                      size="lg"
                    >
                      {isGeneratingAudio ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Generating Audio...
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-4 h-4" />
                          Generate Audio Summary
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <Button
                      onClick={handleAudioToggle}
                      className="flex items-center gap-2"
                      size="lg"
                    >
                      {isAudioPlaying ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5" />
                      )}
                      {isAudioPlaying ? 'Pause' : 'Play'} Audio
                    </Button>
                    
                    <Button
                      onClick={handleDownloadAudio}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download MP3
                    </Button>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Volume2 className="w-4 h-4" />
                      Audio summary available
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Flashcards */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </span>
                Interactive Flashcards
              </CardTitle>
              <CardDescription>
                Test your understanding with these Q&A cards
              </CardDescription>
            </CardHeader>
            <CardContent>
              {results.flashcards.length > 0 ? (
                <div className="space-y-6">
                  {/* Card Counter */}
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Card {currentFlashcardIndex + 1} of {results.flashcards.length}
                    </p>
                  </div>

                  {/* Current Flashcard */}
                  <div className="relative">
                    <div
                      className={`min-h-[200px] p-6 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                        isCurrentCardFlipped
                          ? 'bg-green-50 border-green-300'
                          : 'bg-blue-50 border-blue-300'
                      }`}
                      onClick={() => handleFlashcardFlip(currentFlashcardIndex)}
                    >
                      <div className="text-center">
                        <div className="mb-4">
                          <span className={`text-xs font-medium px-2 py-1 rounded ${
                            isCurrentCardFlipped
                              ? 'bg-green-200 text-green-800'
                              : 'bg-blue-200 text-blue-800'
                          }`}>
                            {isCurrentCardFlipped ? 'Answer' : 'Question'}
                          </span>
                        </div>
                        <p className="text-lg font-medium text-gray-900 leading-relaxed">
                          {isCurrentCardFlipped ? currentCard.answer : currentCard.question}
                        </p>
                      </div>
                    </div>
                    
                    {/* Flip hint */}
                    <div className="text-center mt-2">
                      <p className="text-xs text-gray-500">
                        Click card to {isCurrentCardFlipped ? 'see question' : 'reveal answer'}
                      </p>
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      onClick={handlePreviousCard}
                      disabled={currentFlashcardIndex === 0}
                      className="flex items-center gap-2"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>

                    <div className="flex gap-2">
                      {results.flashcards.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentFlashcardIndex(index)}
                          className={`w-3 h-3 rounded-full transition-colors ${
                            index === currentFlashcardIndex
                              ? 'bg-blue-500'
                              : 'bg-gray-300 hover:bg-gray-400'
                          }`}
                        />
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      onClick={handleNextCard}
                      disabled={currentFlashcardIndex === results.flashcards.length - 1}
                      className="flex items-center gap-2"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">No flashcards generated</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 
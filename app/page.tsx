'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, FileText, Image, FileType, Brain, Volume2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAppStore } from '@/lib/store';
import { isValidFileType, formatFileSize, getFileTypeCategory } from '@/lib/utils';
import { MAX_FILE_SIZE } from '@/lib/types';

export default function HomePage() {
  const router = useRouter();
  const { 
    file, 
    isProcessing, 
    status, 
    error,
    setFile, 
    setProcessing, 
    setStatus, 
    setError,
    reset,
    setResults 
  } = useAppStore();

  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleFileSelection = (selectedFile: File) => {
    setError(null);

    // Validate file type
    if (!isValidFileType(selectedFile.type)) {
      setError('Please upload a valid file type: .txt, .pdf, .jpg, .png');
      return;
    }

    // Validate file size
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError(`File size must be less than ${formatFileSize(MAX_FILE_SIZE)}`);
      return;
    }

    setFile(selectedFile);
  };

  const handleProcessFile = async () => {
    if (!file) return;

    setProcessing(true);
    setError(null);
    
    try {
      setStatus({
        stage: 'processing',
        message: 'Uploading and processing your file...',
        progress: 20
      });

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      });

      setStatus({
        stage: 'processing',
        message: 'Generating learning content...',
        progress: 75
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Processing failed (${response.status})`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Processing failed');
      }

      // Store the results in Zustand store
      setResults(result.data);

      setStatus({
        stage: 'complete',
        message: 'Processing complete!',
        progress: 100
      });

      // Navigate to results page
      router.push('/learn');

    } catch (error) {
      console.error('Processing error:', error);
      let errorMessage = 'An unexpected error occurred';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      // Handle specific error types
      if (errorMessage.includes('timeout') || errorMessage.includes('504')) {
        errorMessage = 'Processing took too long. Please try with a smaller file or simpler content.';
      } else if (errorMessage.includes('500')) {
        errorMessage = 'Server error during processing. Please try again in a moment.';
      } else if (errorMessage.includes('413')) {
        errorMessage = 'File too large. Please use a smaller file.';
      }
      
      setError(errorMessage);
      setStatus({
        stage: 'error',
        message: 'Processing failed',
        progress: 0
      });
    } finally {
      setProcessing(false);
    }
  };

  const getFileIcon = (fileType: string) => {
    const category = getFileTypeCategory(fileType);
    switch (category) {
      case 'text':
        return <FileText className="w-8 h-8 text-blue-500" />;
      case 'pdf':
        return <FileType className="w-8 h-8 text-red-500" />;
      case 'image':
        return <Image className="w-8 h-8 text-green-500" />;
      default:
        return <FileText className="w-8 h-8 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Buildcast.ai
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Transform any material into efficient learning content with AI-powered extraction, 
            audio summaries, and interactive flashcards.
          </p>
          
          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
            <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-sm">
              <Brain className="w-12 h-12 text-blue-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Smart Extraction</h3>
              <p className="text-gray-600 text-center">AI extracts key concepts from any text, PDF, or image</p>
            </div>
            <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-sm">
              <Volume2 className="w-12 h-12 text-green-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Audio Summaries</h3>
              <p className="text-gray-600 text-center">Listen to AI-generated summaries on the go</p>
            </div>
            <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-sm">
              <Zap className="w-12 h-12 text-purple-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Smart Flashcards</h3>
              <p className="text-gray-600 text-center">Interactive Q&A cards for effective learning</p>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Upload Your Learning Material</CardTitle>
              <CardDescription>
                Support for text files (.txt), PDFs, and images (.jpg, .png)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!file ? (
                <div
                  className={`upload-area ${dragActive ? 'dragover' : ''}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('file-input')?.click()}
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    Drop your file here or click to browse
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports .txt, .pdf, .jpg, .png files up to {formatFileSize(MAX_FILE_SIZE)}
                  </p>
                  <input
                    id="file-input"
                    type="file"
                    className="hidden"
                    accept=".txt,.pdf,.jpg,.jpeg,.png"
                    onChange={handleFileInput}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* File Preview */}
                  <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                    {getFileIcon(file.type)}
                    <div className="ml-4 flex-1">
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(file.size)} • {getFileTypeCategory(file.type).toUpperCase()}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFile(null);
                        setError(null);
                        reset();
                      }}
                    >
                      Remove
                    </Button>
                  </div>

                  {/* Processing Status */}
                  {isProcessing && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{status.message}</span>
                        <span>{status.progress}%</span>
                      </div>
                      <Progress value={status.progress} />
                    </div>
                  )}

                  {/* Error Display */}
                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-700">{error}</p>
                    </div>
                  )}

                  {/* Process Button */}
                  <Button
                    onClick={handleProcessFile}
                    disabled={isProcessing}
                    className="w-full"
                    size="lg"
                  >
                    {isProcessing ? 'Processing...' : 'Generate Learning Content'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500">
          <p>Built for nFactorial AI Cup 2025</p>
        </div>
      </div>
    </div>
  );
} 
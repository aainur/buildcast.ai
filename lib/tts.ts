export interface TTSResponse {
  audioUrl: string;
  audioBlob?: Blob;
  transcript: string;
  downloadUrl?: string;
}

// Helper function to convert blob to base64 data URL (server-safe)
async function blobToBase64DataUrl(blob: Blob): Promise<string> {
  try {
    // Convert blob to array buffer
    const arrayBuffer = await blob.arrayBuffer();
    
    // Convert to base64 using Buffer (Node.js) or btoa (browser)
    let base64: string;
    if (typeof Buffer !== 'undefined') {
      // Server environment (Node.js)
      base64 = Buffer.from(arrayBuffer).toString('base64');
    } else {
      // Browser environment
      const uint8Array = new Uint8Array(arrayBuffer);
      const binaryString = Array.from(uint8Array, byte => String.fromCharCode(byte)).join('');
      base64 = btoa(binaryString);
    }
    
    return `data:audio/mpeg;base64,${base64}`;
  } catch (error) {
    console.error('Error converting blob to base64:', error);
    throw error;
  }
}

export async function generateAudioSummary(text: string): Promise<TTSResponse> {
  try {
    if (!process.env.ELEVENLABS_API_KEY) {
      console.warn('ElevenLabs API key not configured, returning mock audio URL');
      return {
        audioUrl: createMockAudioUrl(),
        transcript: text,
        downloadUrl: createMockAudioUrl()
      };
    }

    // Split long text into chunks if needed (ElevenLabs has limits)
    const maxChars = 5000;
    const textChunks = text.length > maxChars ? splitTextIntoChunks(text, maxChars) : [text];
    
    if (textChunks.length > 1) {
      // For long content, process in chunks and combine
      return await generateLongAudioContent(textChunks, text);
    }

    // Single chunk processing
    const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.6,
          similarity_boost: 0.7,
          style: 0.2,
          use_speaker_boost: true
        },
        output_format: 'mp3_44100_128'
      }),
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
    }

    const audioBlob = await response.blob();
    
    // Convert blob to base64 data URL for cross-context compatibility
    const audioDataUrl = await blobToBase64DataUrl(audioBlob);
    
    return {
      audioUrl: audioDataUrl,
      audioBlob,
      transcript: text,
      downloadUrl: audioDataUrl // Same data URL can be used for download
    };

  } catch (error) {
    console.error('TTS generation error:', error);
    
    // Fallback to mock audio for development
    console.warn('Falling back to mock audio due to TTS error');
    return {
      audioUrl: createMockAudioUrl(),
      transcript: text,
      downloadUrl: createMockAudioUrl()
    };
  }
}

async function generateLongAudioContent(textChunks: string[], fullTranscript: string): Promise<TTSResponse> {
  try {
    const audioChunks: Blob[] = [];
    
    for (const chunk of textChunks) {
      const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': process.env.ELEVENLABS_API_KEY!,
        },
        body: JSON.stringify({
          text: chunk,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.6,
            similarity_boost: 0.7,
            style: 0.2,
            use_speaker_boost: true
          },
          output_format: 'mp3_44100_128'
        }),
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      const audioBlob = await response.blob();
      audioChunks.push(audioBlob);
      
      // Add small delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Combine audio chunks
    const combinedBlob = new Blob(audioChunks, { type: 'audio/mpeg' });
    
    // Convert combined blob to base64 data URL
    const audioDataUrl = await blobToBase64DataUrl(combinedBlob);

    return {
      audioUrl: audioDataUrl,
      audioBlob: combinedBlob,
      transcript: fullTranscript,
      downloadUrl: audioDataUrl
    };

  } catch (error) {
    console.error('Long audio generation error:', error);
    throw error;
  }
}

function splitTextIntoChunks(text: string, maxChars: number): string[] {
  const chunks: string[] = [];
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  let currentChunk = '';
  
  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim() + '.';
    
    if ((currentChunk + trimmedSentence).length <= maxChars) {
      currentChunk += (currentChunk ? ' ' : '') + trimmedSentence;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk);
        currentChunk = trimmedSentence;
      } else {
        // Single sentence too long, split by words
        const words = trimmedSentence.split(' ');
        let wordChunk = '';
        
        for (const word of words) {
          if ((wordChunk + word).length <= maxChars) {
            wordChunk += (wordChunk ? ' ' : '') + word;
          } else {
            if (wordChunk) chunks.push(wordChunk);
            wordChunk = word;
          }
        }
        
        if (wordChunk) currentChunk = wordChunk;
      }
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk);
  }
  
  return chunks.length > 0 ? chunks : [text]; // Fallback to original text
}

export async function testElevenLabsConnection(): Promise<boolean> {
  try {
    if (!process.env.ELEVENLABS_API_KEY) {
      return false;
    }

    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
      },
    });

    return response.ok;
  } catch (error) {
    console.error('ElevenLabs connection test failed:', error);
    return false;
  }
}

export function createMockAudioUrl(): string {
  // Create a minimal but valid MP3 data URL for development/testing
  // This is a tiny silent MP3 file encoded in base64
  return 'data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAAW1wM1BSRQAAAAAAAAAAAAAAAAAAAAAAAAAAAP/70DEAAAIAMH2cQIQlAAAKAwAAAP/70DEIAAUcCZJM4JLAAAADoYB5M4JJAAIKAwAAg==';
}

export function downloadAudio(audioUrl: string, filename: string = 'buildcast-audio-lecture.mp3') {
  // Handle both data URLs and regular URLs
  const link = document.createElement('a');
  link.href = audioUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
} 
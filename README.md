# Buildcast.ai

Build for nFactorial Ai Cup 2025

**Ainur Aman**

**Buildcast.ai - AI-Powered Fast Learning and Revising Assistant**
Transform any material into efficient learning content with AI-powered extraction, audio summaries, and interactive flashcards. Built with Next.js 14, TypeScript, Claude 3 Haiku, and ElevenLabs for the nFactorial AI Cup 2025.

If you promised to read that material before a meeting or exam and now need to review it in minutes, this app is for you.

## ✨ Check the app

https://buildcast-ai.vercel.app/

## 🎯 Features

- **Smart Content Extraction**: Upload text files, PDFs, or images and extract key concepts using Claude 3 Haiku
- **Audio Summaries**: Generate natural-sounding audio summaries using ElevenLabs text-to-speech
- **Interactive Flashcards**: AI-generated Q&A flashcards for effective learning
- **OCR Support**: Extract text from images using Tesseract.js
- **Mobile**: Optimized for all devices with modern UI/UX
- **Real-time Processing**: Live progress tracking and error handling

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS
- **UI Components**: Shadcn UI, Radix UI, Lucide React
- **State Management**: Zustand
- **AI Integration**: Claude 3 Haiku (Anthropic)
- **Text-to-Speech**: ElevenLabs API
- **OCR**: Tesseract.js
- **File Processing**: PDF-parse for PDF text extraction
- **Deployment**: Vercel

## Prompt Chaining Architecture
graph TD
  A[File Upload] --> B[Text Extraction Agent]
  B --> C[Claude Analysis Agent]
  C --> D[Content Structuring Agent]
  D --> E[Audio Generation Agent]
  E --> F[Response Assembly Agent]

## How Anthropic’s Principles Influenced the Architecture

- ** Helpfulness**:
The agent doesn’t just answer questions — it gives a complete picture of the material. It highlights key terms and concepts, explains the core ideas, and helps the user quickly get back into context or fully understand the topic from scratch.

- ** Honesty **:
Claude only receives a limited context: the exact text uploaded by the user. Prompt instructions are strictly controlled, so all output is fully grounded in the input. The model has no access to the internet or external data — it works only with what the user provides.

- ** Harmlessness **:
The agent restricts the model’s scope to prevent it from going beyond educational purposes. All outputs are focused solely on safe, structured, and study-related content.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Anthropic API key (Claude 3 Haiku)
- ElevenLabs API key (optional, for audio features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/buildcast.ai.git
   cd buildcast.ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   # Anthropic Claude API Configuration
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   ANTHROPIC_API_VERSION=2023-06-01

   # ElevenLabs Text-to-Speech API Configuration  
   ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

   # Development settings
   NODE_ENV=development
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔑 API Keys Setup

### Anthropic Claude API
1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Create an account and generate an API key
3. Add the key to your `.env.local` file as `ANTHROPIC_API_KEY`

### ElevenLabs API (Optional)
1. Visit [ElevenLabs](https://elevenlabs.io/)
2. Create an account and generate an API key
3. Add the key to your `.env.local` file as `ELEVENLABS_API_KEY`

*Note: The app will work without ElevenLabs API key, but audio features will be disabled.*

## 📁 Project Structure

```
buildcast.ai/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Landing page with file upload
│   ├── learn/             # Learning results page
│   ├── api/generate/      # Main processing API route
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # React components
│   └── ui/               # Shadcn UI components
├── lib/                  # Utility libraries
│   ├── ai.ts            # Claude AI integration
│   ├── ocr.ts           # Tesseract.js OCR
│   ├── tts.ts           # ElevenLabs TTS
│   ├── store.ts         # Zustand state management
│   ├── types.ts         # TypeScript definitions
│   └── utils.ts         # Utility functions
├── public/              # Static assets
└── README.md           # This file
```

## 🎮 Usage

1. **Upload a file**: Drag and drop or click to select a text file (.txt), PDF, or image (.jpg, .png)
2. **Processing**: The AI will extract text, analyze content, and generate learning materials
3. **Review results**: 
   - View key concepts extracted from your material
   - Listen to an AI-generated audio summary
   - Study with interactive flashcards
4. **Learn efficiently**: Use the flashcards to test your understanding

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Key Components

- **File Upload**: Drag-drop interface with validation
- **AI Processing**: Claude 3 Haiku integration for content analysis
- **Audio Generation**: ElevenLabs TTS for summary narration
- **Flashcard System**: Interactive Q&A cards with flip animations
- **State Management**: Zustand for global app state

## 🚀 Deployment

### Deployed to Vercel and available at https://buildcast-ai.vercel.app/

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏆 nFactorial AI Cup 2025

This project was built for the nFactorial AI Cup 2025, demonstrating:
- Multimodal AI interaction (text, image, audio)
- Real-world problem solving (efficient learning)
- Production-ready architecture
- Modern development practices

---

**Built with ❤️ for nFactorial AI Cup 2025** 

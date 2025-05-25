# Buildcast.ai

Fork this repository and build nFactorial Ai Cup 2025 projects

**Ainur Seidakhmet**

**Buildcast.ai - AI-Powered Learning Assistant**

Transform any material into efficient learning content with AI-powered extraction, audio summaries, and interactive flashcards. Built with Next.js 14, TypeScript, Claude 3 Haiku, and ElevenLabs for the nFactorial AI Cup 2025.

## 🎯 Features

- **Smart Content Extraction**: Upload text files, PDFs, or images and extract key concepts using Claude 3 Haiku
- **Audio Summaries**: Generate natural-sounding audio summaries using ElevenLabs text-to-speech
- **Interactive Flashcards**: AI-generated Q&A flashcards for effective learning
- **OCR Support**: Extract text from images using Tesseract.js
- **Mobile-Responsive**: Optimized for all devices with modern UI/UX
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

### Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**
   - Visit [Vercel](https://vercel.com/)
   - Import your GitHub repository
   - Configure environment variables in Vercel dashboard

3. **Environment Variables in Vercel**
   Add these in your Vercel project settings:
   - `ANTHROPIC_API_KEY`
   - `ANTHROPIC_API_VERSION`
   - `ELEVENLABS_API_KEY`

4. **Deploy**
   Vercel will automatically deploy on every push to main branch

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🔒 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | Claude 3 Haiku API key for content processing |
| `ANTHROPIC_API_VERSION` | No | API version (defaults to 2023-06-01) |
| `ELEVENLABS_API_KEY` | No | ElevenLabs API key for audio generation |
| `NODE_ENV` | No | Environment (development/production) |
| `NEXT_PUBLIC_APP_URL` | No | App URL for metadata |

## 🐛 Troubleshooting

### Common Issues

1. **"ANTHROPIC_API_KEY is not configured"**
   - Ensure you've added your Anthropic API key to `.env.local`
   - Restart the development server after adding environment variables

2. **PDF processing fails**
   - Ensure the PDF contains readable text (not scanned images)
   - Try with a different PDF file

3. **OCR not working**
   - Ensure images contain clear, readable text
   - Supported formats: .jpg, .jpeg, .png
   - Maximum file size: 5MB for images

4. **Audio not playing**
   - Check if ElevenLabs API key is configured
   - Audio generation is optional and app works without it

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏆 nFactorial AI Cup 2025

This project was built for the nFactorial AI Cup 2025, demonstrating:
- Multimodal AI interaction (text, image, audio)
- Real-world problem solving (efficient learning)
- Production-ready architecture
- Modern web development practices

## 📞 Support

For support, email [your-email@example.com] or create an issue in the GitHub repository.

---

**Built with ❤️ for nFactorial AI Cup 2025** 
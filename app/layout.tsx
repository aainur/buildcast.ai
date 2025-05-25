import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Buildcast.ai - Learn Efficiently from Any Material",
  description: "Upload text, PDFs, or images and get key concepts, audio summaries, and flashcards for efficient learning.",
  keywords: "AI learning, study assistant, flashcards, text-to-speech, OCR, Claude AI",
  authors: [{ name: "nFactorial AI Cup 2025" }],
  robots: "index, follow",
  openGraph: {
    title: "Buildcast.ai - Learn Efficiently from Any Material",
    description: "AI-powered learning assistant that extracts key concepts, generates audio summaries, and creates flashcards from your materials.",
    type: "website",
    locale: "en_US",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          {children}
        </main>
      </body>
    </html>
  );
} 
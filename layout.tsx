import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Frameflow — Embeddable Photo Gallery',
  description: 'A private, responsive photo gallery widget for Notion and the web.',
  openGraph: {
    title: 'Frameflow — Embeddable Photo Gallery',
    description: 'Your photos. Your gallery.',
    images: [{ url: '/og.png', width: 1731, height: 909, alt: 'Frameflow — Your photos. Your gallery.' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Frameflow — Embeddable Photo Gallery',
    description: 'Your photos. Your gallery.',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

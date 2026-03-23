import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Suspense } from 'react';
import NavBar from '@/components/NavBar';
import ThemeProvider from '@/contexts/ThemeProvider';
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
  title: 'F1 Tracker',
  description: 'Formula 1 data tracking and visualization',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="bg-background text-foreground flex h-full flex-col overflow-hidden">
        <ThemeProvider>
          <Suspense
            fallback={
              <header className="border-border bg-surface sticky top-0 z-50 border-b">
                <div className="mx-auto flex h-[72px] max-w-7xl items-center px-6 py-4" />
              </header>
            }
          >
            <NavBar />
          </Suspense>
          <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}

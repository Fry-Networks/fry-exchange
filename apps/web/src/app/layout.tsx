import type { Metadata } from 'next';
import '@/styles/globals.css';
import { Providers } from '@/components/providers';

export const metadata: Metadata = {
  title: 'Fry Exchange | Trade Crypto with Confidence',
  description:
    'Fry Exchange is a next-generation cryptocurrency exchange with advanced trading features, low fees, and a native AMM.',
  keywords: ['crypto', 'exchange', 'trading', 'bitcoin', 'ethereum', 'defi'],
  authors: [{ name: 'Fry Networks' }],
  openGraph: {
    title: 'Fry Exchange',
    description: 'Trade Crypto with Confidence',
    type: 'website',
    siteName: 'Fry Exchange',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fry Exchange',
    description: 'Trade Crypto with Confidence',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

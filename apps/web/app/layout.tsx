import type { Metadata, Viewport } from 'next';
import '@zakisheriff/liquid-glass/styles.css';
import './styles.css';
import './site-pages.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://supplai-1.vercel.app'),
  title: 'Supplai | Medicine logistics, made visible',
  description:
    'Coordinate medicine requests, stock, riders, and accountable delivery across states, LGAs, wards, and public facilities with Supplai.',
  applicationName: 'Supplai',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Supplai | Medicine logistics, made visible',
    description:
      'Coordinate medicine requests, stock, riders, and accountable delivery across Nigerian public-health networks.',
    siteName: 'Supplai',
    type: 'website',
    url: 'https://supplai-1.vercel.app',
    locale: 'en_NG',
  },
  twitter: {
    card: 'summary',
    title: 'Supplai | Medicine logistics, made visible',
    description:
      'Medicine requests, facility stock, and accountable delivery in one place.',
  },
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="light">
      <body>{children}</body>
    </html>
  );
}

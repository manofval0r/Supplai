import type { Metadata } from 'next';
import App from '../src/App';
import '../src/components/landing/landing.css';

export const metadata: Metadata = {
  title: 'Supplai | Medicine logistics, made visible',
  description:
    'Coordinate medicine requests, stock, riders, and accountable delivery across states, LGAs, wards, and public facilities with Supplai.',
  applicationName: 'Supplai',
  keywords: [
    'medicine logistics',
    'public health supply chain',
    'LGA operations',
    'facility stock coordination',
    'Nigeria medicine supply',
    'Supplai',
  ],
  openGraph: {
    title: 'Supplai | Medicine logistics, made visible',
    description:
      'Coordinate medicine requests, stock, riders, and accountable delivery across Nigerian public-health networks.',
    siteName: 'Supplai',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Supplai | Medicine logistics, made visible',
    description:
      'Coordinate medicine requests, stock, riders, and accountable delivery across Nigerian public-health networks.',
  },
};

export default function HomePage() {
  return <App />;
}

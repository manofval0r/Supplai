import type { Metadata } from 'next';
import '../src/styles.css';

export const metadata: Metadata = {
  title: 'Supplai | LGA Operations',
  description: 'Medicine movement, made visible.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

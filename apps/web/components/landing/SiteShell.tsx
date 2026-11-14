import { Plus_Jakarta_Sans } from 'next/font/google';
import type { ReactNode } from 'react';
import { SiteFooter } from './CtaFooter';
import Navbar from './Navbar';
import styles from './landing.module.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700', '800'],
  display: 'swap',
  variable: '--font-display',
});

export default function SiteShell({
  children,
  hideFooter = false,
}: {
  children: ReactNode;
  hideFooter?: boolean;
}) {
  return (
    <div id="top" className={`${styles.page} ${plusJakartaSans.variable}`}>
      <Navbar />
      <div className={styles.shellBody}>{children}</div>
      {!hideFooter && <SiteFooter />}
    </div>
  );
}

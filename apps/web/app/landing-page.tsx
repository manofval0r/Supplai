import { Plus_Jakarta_Sans } from 'next/font/google';
import CtaFooter from '../components/landing/CtaFooter';
import FeatureTabs from '../components/landing/FeatureTabs';
import Hero from '../components/landing/Hero';
import Marquee from '../components/landing/Marquee';
import Navbar from '../components/landing/Navbar';
import PhoneMockups from '../components/landing/PhoneMockups';
import Stepper from '../components/landing/Stepper';
import styles from '../components/landing/landing.module.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700', '800'],
  display: 'swap',
  variable: '--font-display',
});

export default function LandingPage() {
  return (
    <main className={`${styles.page} ${plusJakartaSans.variable}`}>
      <Navbar />
      <Hero />
      <FeatureTabs />
      <Stepper />
      <Marquee />
      <PhoneMockups />
      <CtaFooter />
    </main>
  );
}

'use client';

import About from './About';
import Faq from './Faq';
import Features from './Features';
import FinalCta from './FinalCta';
import Footer from './Footer';
import Hero from './Hero';
import HowItWorks from './HowItWorks';
import Marquee from './Marquee';
import Navbar from './Navbar';
import ProductShowcase from './ProductShowcase';
// import Testimonials from './Testimonials';
import TrustSafety from './TrustSafety';
import useReveal from './useReveal';

export default function LandingPage({
  onOpenDashboard,
}: {
  onOpenDashboard: () => void;
}) {
  useReveal();

  return (
    <div className="lp-root">
      <a className="lp-skip" href="#lp-main">
        Skip to main content
      </a>

      <Navbar onOpenDashboard={onOpenDashboard} />

      <main id="lp-main">
        <Hero onOpenDashboard={onOpenDashboard} />
        <Marquee />
        <HowItWorks />
        <Features />
        <About />
        <ProductShowcase />
        <TrustSafety />
        {/* <Testimonials /> */}
        <Faq />
        <FinalCta onOpenDashboard={onOpenDashboard} />
      </main>

      <Footer onOpenDashboard={onOpenDashboard} />
    </div>
  );
}

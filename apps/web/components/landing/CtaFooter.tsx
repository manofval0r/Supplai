import Link from 'next/link';
import { landingContent } from './content';
import styles from './landing.module.css';

function BrandMark() {
  return (
    <Link className={styles.brand} href="/" aria-label="Supplai home">
      <span className={styles.brandMark} aria-hidden="true">
        +
      </span>
      <span>supplai</span>
    </Link>
  );
}

export function SiteFooter() {
  const { footer } = landingContent;

  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerTop}>
          <div className={styles.footerBrand}>
            <BrandMark />
            <p className={styles.footerLead}>
              Role-based mobile and web logistics coordinating verified,
              ambient-only essential medicine transfers between Nigerian primary
              health centres.
            </p>
            <p className={styles.footerDisclosure}>
              Demo Data · Ado-Odo/Ota LGA Simulation · {footer.description}
            </p>
          </div>

          <div className={styles.footerColumns}>
            <div className={styles.footerCol}>
              <h3>Platform</h3>
              <Link href="/">Overview</Link>
              <Link href="/dashboard">Interactive Console</Link>
              <Link href="/lga">LGA Oversight Desk</Link>
              <Link href="/app-preview">App Preview &amp; APK</Link>
              <Link href="/login">Demo Sign In</Link>
            </div>

            <div className={styles.footerCol}>
              <h3>Workflow &amp; Safety</h3>
              <Link href="/#our-network">Our Network</Link>
              <Link href="/#how-it-works">3-Step Handover</Link>
              <Link href="/#app-preview">Facility Mobile App</Link>
              <span className={styles.footerStatic}>
                ORS 20.5 g &amp; Zinc 20 mg Only
              </span>
              <span className={styles.footerStatic}>
                Cold-Chain Routed to LGA Store
              </span>
            </div>
          </div>

          <svg
            aria-hidden="true"
            className={styles.footerBadge}
            viewBox="0 0 120 120"
          >
            <defs>
              <path
                d="M60 60m-43 0a43 43 0 1 1 86 0a43 43 0 1 1-86 0"
                id="footer-badge-circle"
              />
            </defs>
            <circle cx="60" cy="60" r="57" />
            <text>
              <textPath href="#footer-badge-circle">
                supplai · supplai · supplai ·
              </textPath>
            </text>
            <path d="M60 36v48M36 60h48" />
          </svg>
        </div>

        <svg
          aria-hidden="true"
          className={styles.footerIllustration}
          viewBox="0 0 1200 132"
          preserveAspectRatio="none"
        >
          <path
            d="M0 108 H190 L224 72 H360 L388 94 H552 L584 48 H668 L700 84 H890 L926 56 H1040 L1076 94 H1200"
            fill="none"
            stroke="#1558C9"
            strokeWidth="3"
          />
          <rect
            x="58"
            y="58"
            width="64"
            height="50"
            rx="6"
            fill="#1558C9"
            fillOpacity="0.35"
            stroke="#1558C9"
            strokeWidth="2"
          />
          <path d="M90 73 V93 M80 83 H100" stroke="#D4FF24" strokeWidth="3.5" />
          <rect
            x="592"
            y="24"
            width="70"
            height="58"
            rx="8"
            fill="#1558C9"
            stroke="#D4FF24"
            strokeWidth="2.5"
          />
          <path d="M627 39 V65 M614 52 H640" stroke="#D4FF24" strokeWidth="4" />
          <rect
            x="934"
            y="34"
            width="92"
            height="48"
            rx="6"
            fill="#1558C9"
            fillOpacity="0.28"
            stroke="#1558C9"
            strokeWidth="2"
          />
          <circle cx="224" cy="72" r="6" fill="#D4FF24" />
          <circle cx="627" cy="82" r="6" fill="#D4FF24" />
          <circle cx="926" cy="56" r="6" fill="#D4FF24" />
          <path
            d="M224 72 Q420 18 627 82 T926 56"
            fill="none"
            stroke="#D4FF24"
            strokeWidth="2.5"
            strokeDasharray="8 8"
          />
        </svg>

        <div className={styles.footerBottom}>
          <span>Supplai Logistics · Fictional Demo Environment</span>
          <span>
            Palette: Midnight Black #030407 · Electric Cobalt #1558C9 · Acid
            Lime #D4FF24
          </span>
        </div>
      </div>
    </footer>
  );
}

export default function CtaFooter() {
  const { callToAction } = landingContent;

  return (
    <>
      <section className={styles.callToAction}>
        <div>
          <p className={styles.ctaEyebrow}>{callToAction.eyebrow}</p>
          <h2>{callToAction.headline}</h2>
        </div>
        <Link className={styles.ctaButton} href="/dashboard">
          {callToAction.action} <span aria-hidden="true">→</span>
        </Link>
      </section>

      <SiteFooter />
    </>
  );
}

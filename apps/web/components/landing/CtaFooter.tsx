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

export default function CtaFooter() {
  const { callToAction, footer, navigation } = landingContent;

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

      <footer className={styles.footer}>
        <div className={styles.footerBrand}>
          <BrandMark />
          <p>{footer.description}</p>
        </div>
        <nav aria-label="Footer navigation" className={styles.footerLinks}>
          {navigation.map((item) => (
            <a href={item.href} key={item.href}>
              {item.label}
            </a>
          ))}
          <Link href="/app-preview">App Preview</Link>
          <Link href="/lga">LGA Desk</Link>
          <Link href="/dashboard">Dashboard</Link>
        </nav>
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
      </footer>
    </>
  );
}

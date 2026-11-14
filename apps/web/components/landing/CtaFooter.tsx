import Link from 'next/link';
import { landingContent } from './content';
import styles from './footer.module.css';
import landing from './landing.module.css';

function BrandMark() {
  return (
    <Link className={landing.brand} href="/" aria-label="Supplai home">
      <span className={landing.brandMark} aria-hidden="true">
        +
      </span>
      <span>supplai</span>
    </Link>
  );
}

function Scene() {
  return (
    <div className={styles.scene} aria-hidden="true">
      <svg viewBox="0 0 1200 240" preserveAspectRatio="xMidYMax slice">
        <path d="M0 214 H1200" stroke="#1558C9" strokeWidth="3" fill="none" />
        {/* far skyline */}
        <g fill="#1558C9" fillOpacity="0.22">
          <rect x="40" y="150" width="54" height="64" />
          <rect x="100" y="124" width="40" height="90" />
          <rect x="300" y="140" width="70" height="74" />
          <rect x="376" y="160" width="44" height="54" />
          <rect x="760" y="132" width="60" height="82" />
          <rect x="826" y="156" width="50" height="58" />
          <rect x="1090" y="136" width="56" height="78" />
        </g>
        {/* source clinic */}
        <g>
          <rect x="150" y="150" width="130" height="64" rx="6" fill="#1558C9" />
          <rect x="176" y="176" width="22" height="38" rx="3" fill="#030407" />
          <rect
            x="214"
            y="170"
            width="40"
            height="22"
            rx="3"
            fill="#030407"
            fillOpacity="0.55"
          />
          <path
            d="M215 128 V150 M204 139 H226"
            stroke="#D4FF24"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </g>
        {/* LGA store */}
        <g>
          <rect
            x="520"
            y="70"
            width="150"
            height="144"
            rx="8"
            fill="#1558C9"
            stroke="#D4FF24"
            strokeWidth="3"
          />
          {[0, 1, 2].map((row) =>
            [0, 1, 2].map((col) => (
              <rect
                key={`${row}-${col}`}
                x={540 + col * 42}
                y={92 + row * 34}
                width="26"
                height="18"
                rx="3"
                fill="#030407"
                fillOpacity="0.5"
              />
            )),
          )}
          <circle cx="595" cy="46" r="20" fill="#D4FF24" />
          <path
            d="M595 36 V56 M585 46 H605"
            stroke="#030407"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
        </g>
        {/* receiving PHC */}
        <g>
          <rect
            x="930"
            y="140"
            width="150"
            height="74"
            rx="6"
            fill="#1558C9"
            fillOpacity="0.8"
          />
          <rect x="990" y="172" width="26" height="42" rx="3" fill="#030407" />
          <path
            d="M1005 112 V138 M992 125 H1018"
            stroke="#D4FF24"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </g>
        {/* dispatch route */}
        <path
          className={styles.route}
          d="M232 206 C330 120 440 120 595 206 S880 120 1005 206"
          fill="none"
          stroke="#D4FF24"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="10 12"
        />
        <circle cx="232" cy="206" r="7" fill="#D4FF24" />
        <circle cx="595" cy="206" r="7" fill="#D4FF24" />
        <circle cx="1005" cy="206" r="7" fill="#D4FF24" />
      </svg>
    </div>
  );
}

export function SiteFooter() {
  const { callToAction, footer } = landingContent;

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <section className={styles.cta} aria-label="Get started">
          <div className={styles.ctaCopy}>
            <p className={styles.ctaEyebrow}>{callToAction.eyebrow}</p>
            <h2>{callToAction.headline}</h2>
          </div>
          <div className={styles.ctaActions}>
            <Link className={styles.btnDark} href="/dashboard">
              {callToAction.action} <span aria-hidden="true">→</span>
            </Link>
            <Link className={styles.btnGhost} href="/app-preview">
              See the mobile app
            </Link>
          </div>
        </section>

        <div className={styles.grid}>
          <div className={styles.brandCol}>
            <BrandMark />
            <p className={styles.lead}>
              Role-based mobile and web logistics coordinating verified,
              ambient-only essential medicine transfers between Nigerian primary
              health centres. {footer.description}
            </p>
            <div className={styles.chips}>
              <span className={styles.chip}>
                <i /> Demo environment
              </span>
              <span className={styles.chip}>Ado-Odo/Ota LGA simulation</span>
            </div>
          </div>

          <nav className={styles.col} aria-label="Platform">
            <h3>Platform</h3>
            <Link href="/">Overview</Link>
            <Link href="/dashboard">Interactive console</Link>
            <Link href="/lga">LGA oversight desk</Link>
            <Link href="/app-preview">App preview &amp; APK</Link>
            <Link href="/login">Demo sign in</Link>
          </nav>

          <nav className={styles.col} aria-label="Workflow">
            <h3>Workflow</h3>
            <Link href="/#our-network">Our network</Link>
            <Link href="/#how-it-works">3-step handover</Link>
            <Link href="/#app-preview">Facility mobile app</Link>
          </nav>

          <div className={styles.col}>
            <h3>Safety rules</h3>
            <span className={styles.rule}>
              <b>✓</b> ORS 20.5 g &amp; Zinc 20 mg only
            </span>
            <span className={styles.rule}>
              <b>✓</b> Source safety floor ≥ 20
            </span>
            <span className={styles.rule}>
              <b>✓</b> Two-sided PIN &amp; seal handover
            </span>
          </div>
        </div>
      </div>

      <Scene />
      <p className={styles.wordmark} aria-hidden="true">
        supplai
      </p>

      <div className={styles.bottom}>
        <div
          className={styles.inner}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 14,
          }}
        >
          <span>
            © {new Date().getFullYear()} Supplai Logistics · All facilities,
            stock, and deliveries are fictional.
          </span>
          <Link className={styles.top} href="#top">
            Back to top <span aria-hidden="true">↑</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default function CtaFooter() {
  return <SiteFooter />;
}

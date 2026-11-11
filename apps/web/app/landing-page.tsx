import Link from 'next/link';

const steps = [
  {
    number: '01',
    title: 'See what is available',
    body: 'Facilities share essential-medicine stock with trusted partners nearby.',
  },
  {
    number: '02',
    title: 'Coordinate a transfer',
    body: 'A clear request connects a facility with stock to the team that needs it.',
  },
  {
    number: '03',
    title: 'Follow every handover',
    body: 'Track the rider, confirm receipt, and keep a reliable record from start to finish.',
  },
];

export default function LandingPage() {
  return (
    <main className="site-page landing-page">
      <header className="site-header">
        <Link className="site-brand" href="/" aria-label="Supplai home">
          <span className="brand-mark" aria-hidden="true">
            +
          </span>
          <span>supplai</span>
        </Link>
        <nav className="site-nav" aria-label="Main navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#our-network">Our network</a>
        </nav>
        <Link className="site-login-link" href="/login">
          Log in <span aria-hidden="true">↗</span>
        </Link>
      </header>

      <section className="landing-hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="eyebrow-dot" />A stronger supply network for local
            care
          </div>
          <h1>
            Essential medicine,
            <br />
            <span>where it&apos;s needed.</span>
          </h1>
          <p>
            Supplai helps health facilities coordinate essential stock and
            accountable delivery, so care teams can focus on the people who need
            them.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/login">
              Explore the demo <span aria-hidden="true">→</span>
            </Link>
            <a className="button button-quiet" href="#how-it-works">
              How Supplai works
            </a>
          </div>
          <div className="hero-proof">
            <span className="proof-avatar" aria-hidden="true">
              <span>+</span>
            </span>
            <span>
              <strong>Connected care, closer to home.</strong>
              <small>
                Built for facility teams and local delivery partners
              </small>
            </span>
          </div>
        </div>

        <div
          className="hero-visual"
          aria-label="Illustration of connected medicine deliveries"
        >
          <div className="visual-orbit orbit-one" />
          <div className="visual-orbit orbit-two" />
          <div className="visual-cross cross-one">+</div>
          <div className="visual-cross cross-two">+</div>
          <div className="network-card">
            <div className="network-topline">
              <span>LOCAL NETWORK</span>
              <span className="network-live">
                <i /> LIVE
              </span>
            </div>
            <div className="network-map" aria-hidden="true">
              <svg viewBox="0 0 480 300" role="presentation">
                <path
                  className="map-road road-one"
                  d="M56 228 C132 218 123 135 205 146 S304 214 411 80"
                />
                <path
                  className="map-road road-two"
                  d="M102 57 C149 119 189 88 224 147 S304 239 390 244"
                />
                <path
                  className="map-route"
                  d="M103 211 C157 212 156 144 218 146 S302 197 371 94"
                />
              </svg>
              <span className="map-node node-a">
                <i />
              </span>
              <span className="map-node node-b">
                <i />
              </span>
              <span className="map-node node-c">
                <i />
              </span>
              <span className="map-node node-d">
                <i />
              </span>
              <span className="map-label label-a">Aiyetoro PHC</span>
              <span className="map-label label-b">Ota Health Centre</span>
              <span className="map-rider" aria-label="Delivery rider">
                ↗
              </span>
            </div>
            <div className="network-footer">
              <span className="network-footer-icon">✳</span>
              <span>
                <strong>Supplies in motion</strong>
                <small>Facilities connected across the local network</small>
              </span>
              <span className="network-arrow" aria-hidden="true">
                ↗
              </span>
            </div>
          </div>
          <div className="stock-card">
            <span className="stock-icon" aria-hidden="true">
              ✚
            </span>
            <span>
              <small>ESSENTIAL STOCK</small>
              <strong>ORS &amp; zinc</strong>
            </span>
            <span className="stock-status">Available</span>
          </div>
          <div className="delivery-card">
            <span className="delivery-check" aria-hidden="true">
              ✓
            </span>
            <span>
              <strong>Handover confirmed</strong>
              <small>Delivery record updated</small>
            </span>
          </div>
        </div>
      </section>

      <section
        className="network-strip"
        id="our-network"
        aria-label="Supplai network benefits"
      >
        <div>
          <span>01</span> Facility-to-facility coordination
        </div>
        <div>
          <span>02</span> Clear delivery milestones
        </div>
        <div>
          <span>03</span> Accountable handovers
        </div>
        <div className="strip-location">
          <i /> Designed for local health networks
        </div>
      </section>

      <section className="how-section" id="how-it-works">
        <div className="section-intro">
          <div className="eyebrow">
            <span className="eyebrow-dot" /> A simpler way to move stock
          </div>
          <h2>
            From available stock
            <br />
            to a confirmed handover.
          </h2>
          <p>
            One shared view helps every person in the journey know what happens
            next.
          </p>
        </div>
        <div className="steps-grid">
          {steps.map((step) => (
            <article className="step-card" key={step.number}>
              <span className="step-number">{step.number}</span>
              <div className="step-icon" aria-hidden="true">
                {step.number === '01' ? '⌕' : step.number === '02' ? '↗' : '✓'}
              </div>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-cta">
        <div>
          <span className="cta-kicker">A better-connected supply chain</span>
          <h2>Let&apos;s get essential supplies moving.</h2>
        </div>
        <Link className="button button-light" href="/login">
          Open the Supplai demo <span aria-hidden="true">→</span>
        </Link>
      </section>

      <footer className="site-footer">
        <Link className="site-brand" href="/">
          <span className="brand-mark" aria-hidden="true">
            +
          </span>
          <span>supplai</span>
        </Link>
        <span>Making essential medicine logistics more visible.</span>
        <span>Demo experience · Fictional facilities and stock figures</span>
      </footer>
    </main>
  );
}

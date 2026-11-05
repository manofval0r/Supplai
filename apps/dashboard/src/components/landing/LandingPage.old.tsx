'use client';

/**
 * Backup of the original Supplai landing page, kept for reference.
 * The redesigned landing page lives in `LandingPage.tsx`.
 */
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRoute } from '@fortawesome/free-solid-svg-icons';

function TopoLinesEffect() {
  return (
    <div
      data-aifx="topo-lines"
      className="topo-lines-effect"
      aria-hidden="true"
    />
  );
}

export default function LandingPageOld({
  onOpenDashboard,
}: {
  onOpenDashboard: () => void;
}) {
  return (
    <main className="landing-page">
      <div className="landing-page__backdrop">
        <TopoLinesEffect />
      </div>
      <header className="landing-header">
        <div className="brand">
          <span className="brand-mark">S</span>
          <span>supplai</span>
        </div>
        <button className="landing-login" onClick={onOpenDashboard}>
          Open dashboard
        </button>
      </header>
      <section className="landing-hero">
        <div className="landing-hero__frame">
          <div className="landing-hero__copy">
            <h1>
              Move essential stock
              <span> where it matters.</span>
            </h1>
            <p>
              A live command center for faster, more accountable medicine
              transfers across every LGA.
            </p>
            <button className="landing-cta" onClick={onOpenDashboard}>
              Open live operations
              <FontAwesomeIcon icon={faRoute} />
            </button>
          </div>
          <div className="landing-hero__stats">
            <strong>8,811</strong>
            <span>wards mapped for better last-mile visibility</span>
            <strong>37</strong>
            <span>states ready to explore</span>
          </div>
        </div>
      </section>
      <section className="landing-features" aria-label="Supplai capabilities">
        <article className="landing-feature-card">
          <span
            className="landing-feature-icon landing-feature-icon--match"
            aria-hidden="true"
          />
          <span>01 / MATCH</span>
          <strong>Request to stock match</strong>
          <p>See facility needs and available surplus before a transfer starts.</p>
        </article>
        <article className="landing-feature-card">
          <span
            className="landing-feature-icon landing-feature-icon--move"
            aria-hidden="true"
          />
          <span>02 / MOVE</span>
          <strong>Route the last mile</strong>
          <p>Coordinate riders and handoffs with a clear live status.</p>
        </article>
        <article className="landing-feature-card">
          <span
            className="landing-feature-icon landing-feature-icon--prove"
            aria-hidden="true"
          />
          <span>03 / PROVE</span>
          <strong>Receipt you can trust</strong>
          <p>Keep delivery proof visible for every public facility and ward.</p>
        </article>
      </section>
      <footer className="landing-footer">
        <span>supplai operations cloud</span>
        <span>Medicine movement, made visible.</span>
      </footer>
    </main>
  );
}

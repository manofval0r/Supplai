const trustBadges = [
  'Public-ledger ready',
  'Facility network',
  'Proof-led movement',
];

export default function Hero({
  onOpenDashboard,
}: {
  onOpenDashboard: () => void;
}) {
  return (
    <section className="lp-hero" id="top" aria-labelledby="lp-hero-title">
      <div className="lp-hero__pattern" aria-hidden="true" />
      <div className="lp-container lp-hero__grid">
        <div className="lp-hero__copy" data-reveal>
          <span className="lp-hero__kicker">
            Medicine logistics, made visible
          </span>

          <h1 className="lp-hero__title" id="lp-hero-title">
            Move essential stock
            <span className="lp-hero__accent">where it matters.</span>
          </h1>

          <p className="lp-hero__lead">
            Supplai helps health operators coordinate medicine requests,
            available stock, riders, and delivery proof across every LGA.
          </p>

          <div className="lp-hero__actions">
            <button
              type="button"
              className="lp-btn lp-btn--primary"
              onClick={onOpenDashboard}
            >
              Open operations dashboard
            </button>
            <a className="lp-btn lp-btn--secondary" href="#how-it-works">
              See how it works
            </a>
          </div>

          <ul className="lp-hero__trust" aria-label="Trust commitments">
            {trustBadges.map((label) => (
              <li key={label}>
                {label}
              </li>
            ))}
          </ul>

          <p className="lp-hero__note">
            Built for public facilities, last-mile teams, and accountable
            medicine movement.
          </p>
        </div>

      </div>
    </section>
  );
}

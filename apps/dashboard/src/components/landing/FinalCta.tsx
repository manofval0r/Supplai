import { ArrowIcon, SparkIcon, StarIcon } from './icons';

export default function FinalCta({
  onOpenDashboard,
}: {
  onOpenDashboard: () => void;
}) {
  return (
    <section
      className="lp-section lp-section--white lp-final-section"
      id="order"
      aria-labelledby="lp-final-title"
    >
      <div className="lp-container">
        <div className="lp-final" data-reveal>
          <StarIcon className="lp-final__star lp-final__star--one" />
          <SparkIcon className="lp-final__star lp-final__star--two" />
          <StarIcon className="lp-final__star lp-final__star--three" />

          <span className="lp-eyebrow lp-eyebrow--light">
            Ready to coordinate
          </span>
          <h2 id="lp-final-title">
            Make every medicine
            <br />
            movement visible.
          </h2>
          <p>
            Open the Supplai operations console to see how facility needs,
            stock, riders, and delivery proof connect across an LGA.
          </p>

          <div className="lp-final__actions">
            <button
              type="button"
              className="lp-btn lp-btn--white"
              onClick={onOpenDashboard}
            >
              Open operations dashboard
              <ArrowIcon />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

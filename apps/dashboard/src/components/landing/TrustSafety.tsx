import SectionHeading from './SectionHeading';
import { FileCheckIcon, LockIcon, ShieldCheckIcon, StoreIcon } from './icons';

const trustItems = [
  {
    icon: StoreIcon,
    title: 'Facility identity',
    body: 'Every movement is tied to a known public facility, ward, and location context.',
    placeholder: 'FACILITY REGISTRY — INTEGRATION POINT',
  },
  {
    icon: FileCheckIcon,
    title: 'Transfer verification',
    body: 'Requests, stock offers, rider assignment, and receipt form one visible lifecycle.',
    placeholder: 'WORKFLOW STATES — SHARED CONTRACT',
  },
  {
    icon: LockIcon,
    title: 'Proof-led movement',
    body: 'Delivery evidence and timestamps help teams account for medicine after dispatch.',
    placeholder: 'PROOF RETENTION — CONTRACT RULE',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Safe operational boundaries',
    body: 'The console surfaces coordination context without replacing clinical judgment or facility policy.',
    placeholder: 'POLICY CONTROLS — TO CONFIRM',
  },
];

export default function TrustSafety() {
  return (
    <section
      className="lp-section lp-section--green"
      aria-labelledby="lp-trust-title"
    >
      <div className="lp-container">
        <div className="lp-trust-banner" data-reveal>
          <span className="lp-trust-banner__icon" aria-hidden="true">
            <ShieldCheckIcon />
          </span>
          <div>
            <SectionHeading
              eyebrow="Trust & safety"
              title="Accountability is not a feature. It is the baseline."
              description="Medicine logistics only works when teams can trust the request, the movement, and the receipt. Supplai keeps that chain visible."
              id="lp-trust-title"
            />
          </div>
          <span className="lp-sticker lp-sticker--white lp-trust-banner__sticker">
            Proof first
          </span>
        </div>

        <div className="lp-trust-grid">
          {trustItems.map(({ icon: Icon, title, body, placeholder }, index) => (
            <article
              className="lp-trust-card"
              key={title}
              data-reveal
              style={{ transitionDelay: `${index * 60}ms` }}
            >
              <span className="lp-trust-card__icon" aria-hidden="true">
                <Icon />
              </span>
              <h3>{title}</h3>
              <p>{body}</p>
              <span className="lp-placeholder">{placeholder}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

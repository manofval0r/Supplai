import SectionHeading from './SectionHeading';
import {
  BottleIcon,
  CapsuleIcon,
  CheckIcon,
  PinIcon,
  ShieldCheckIcon,
  SparkIcon,
  StoreIcon,
} from './icons';

const stats = [
  { value: '37', label: 'states mapped' },
  { value: '774', label: 'LGAs mapped' },
  { value: '8,811', label: 'wards mapped' },
];

const differences = [
  'A live view of facility needs and transferable stock.',
  'State, LGA, ward, and facility context for every request.',
  'One accountable movement record from request to receipt.',
];

export default function About() {
  return (
    <section
      className="lp-section lp-section--white"
      id="about"
      aria-labelledby="lp-about-title"
    >
      <div className="lp-container lp-about">
        <div className="lp-about__visual" data-reveal>
          <div className="lp-about__panel">
            <div className="lp-about__panel-head">
              <span>Facility to facility</span>
              <span className="lp-about__live">
                <i className="lp-live-dot" />
                Tracked
              </span>
            </div>

            <div className="lp-about__route-card">
              <div className="lp-about__route-points">
                <span className="lp-about__point">
                  <StoreIcon />
                  Supply point
                </span>
                <span className="lp-about__route-line" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
                <span className="lp-about__point">
                  <PinIcon />
                  Public facility
                </span>
              </div>
              <div className="lp-about__route-meta">
                <span>
                  <ShieldCheckIcon />
                  Assigned
                </span>
                <span>
                  <CheckIcon />
                  Recorded
                </span>
              </div>
            </div>

            <div className="lp-about__bottle" aria-hidden="true">
              <BottleIcon />
            </div>
            <div className="lp-about__capsule" aria-hidden="true">
              <CapsuleIcon />
            </div>
            <div className="lp-about__shield" aria-hidden="true">
              <ShieldCheckIcon />
            </div>
            <SparkIcon className="lp-about__spark" />
          </div>

          <div className="lp-about__stats" aria-label="Supplai location data">
            {stats.map((stat, index) => (
              <div className={`lp-stat lp-stat--${index + 1}`} key={stat.label}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>

          <p className="lp-about__source">
            Source: Supplai location dataset. Coverage expands as facilities and
            riders are connected.
          </p>
        </div>

        <div className="lp-about__copy" data-reveal>
          <SectionHeading
            eyebrow="About Supplai"
            title={
              <>
                Essential stock should be
                <br />
                easier to move.
              </>
            }
            id="lp-about-title"
          />

          <p className="lp-about__mission">
            Our mission is simple: make essential medicine easier to move
            without losing visibility or accountability.
          </p>

          <p>
            Supplai connects public facilities, operators, stock, and riders
            around a shared operational picture. It is designed for the real
            world of Nigerian primary healthcare: constrained supply, long
            last-mile routes, and teams that need proof a transfer arrived.
          </p>

          <ul className="lp-about__list">
            {differences.map((item) => (
              <li key={item}>
                <span aria-hidden="true">
                  <CheckIcon />
                </span>
                {item}
              </li>
            ))}
          </ul>

          <div className="lp-about__callout">
            <SparkIcon aria-hidden="true" />
            <p>
              <strong>What makes us different:</strong> we turn fragmented
              medicine movement into a visible, evidence-led workflow for public
              health teams.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

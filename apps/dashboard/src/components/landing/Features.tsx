import SectionHeading from './SectionHeading';
import {
  BoxIcon,
  ClockIcon,
  FileCheckIcon,
  LockIcon,
  RouteIcon,
  ShieldCheckIcon,
} from './icons';

const features = [
  {
    icon: RouteIcon,
    title: 'See the LGA position',
    body: 'Monitor stockouts, unmet requests, active transfers, and facility response in one command view.',
    tone: 'blue',
    wide: true,
  },
  {
    icon: FileCheckIcon,
    title: 'Map the last mile',
    body: 'Move from state to LGA to ward context with location data built into the operations workflow.',
    tone: 'green',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Coordinate medicine transfers',
    body: 'Match transferable surplus to facilities below minimum before essential stock sits idle.',
    tone: 'yellow',
  },
  {
    icon: ClockIcon,
    title: 'Keep riders accountable',
    body: 'Assign a rider, track lifecycle status, and make the next handoff visible to the team.',
    tone: 'red',
  },
  {
    icon: LockIcon,
    title: 'Protect the public ledger',
    body: 'Preserve proof codes, timestamps, and delivery evidence without exposing unnecessary detail.',
    tone: 'neutral',
  },
  {
    icon: BoxIcon,
    title: 'Work with real location data',
    body: 'Explore 37 states, 774 LGAs, and 8,811 wards as the network grows.',
    tone: 'blue-soft',
    wide: true,
  },
];

export default function Features() {
  return (
    <section
      className="lp-section lp-section--canvas"
      id="features"
      aria-labelledby="lp-features-title"
    >
      <div className="lp-container">
        <SectionHeading
          eyebrow="Features"
          title={
            <>
              The details that make
              <br />
              medicine movement feel accountable.
            </>
          }
          description="Built for the moments that matter: a facility below minimum, a request waiting for stock, or a delivery that needs proof."
          id="lp-features-title"
        />

        <div className="lp-features">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <article
                className={`lp-feature lp-feature--${feature.tone} ${
                  feature.wide ? 'lp-feature--wide' : ''
                }`}
                key={feature.title}
                data-reveal
                style={{ transitionDelay: `${index * 60}ms` }}
              >
                <span className="lp-feature__icon" aria-hidden="true">
                  <Icon />
                </span>
                <div className="lp-feature__copy">
                  <h3>{feature.title}</h3>
                  <p>{feature.body}</p>
                </div>
                <span className="lp-feature__index" aria-hidden="true">
                  0{index + 1}
                </span>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

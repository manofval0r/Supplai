import SectionHeading from './SectionHeading';
import { CardIcon, ScooterIcon, StoreIcon, UploadIcon } from './icons';

const steps = [
  {
    number: '01',
    icon: UploadIcon,
    title: 'A facility raises a request',
    body: 'Capture what a public facility needs, where it is, and how urgently it is needed.',
    tone: 'blue',
  },
  {
    number: '02',
    icon: StoreIcon,
    title: 'Stock is matched',
    body: 'Operators see available medicine and transferable surplus across connected facilities.',
    tone: 'green',
  },
  {
    number: '03',
    icon: CardIcon,
    title: 'A rider is coordinated',
    body: 'Assign the handoff, follow the route, and keep transfer status visible to the team.',
    tone: 'yellow',
  },
  {
    number: '04',
    icon: ScooterIcon,
    title: 'Receipt is recorded',
    body: 'Confirm delivery at the ward and preserve a public, accountable movement record.',
    tone: 'red',
  },
];

export default function HowItWorks() {
  return (
    <section
      className="lp-section lp-section--white"
      id="how-it-works"
      aria-labelledby="lp-how-title"
    >
      <div className="lp-container">
        <SectionHeading
          eyebrow="How it works"
          title={
            <>
              Four steps from
              <br />
              request to facility.
            </>
          }
          description="From a stockout signal to a verified handoff, every step has an owner, a status, and a place on the map."
          id="lp-how-title"
        />

        <ol
          className="lp-steps"
          data-reveal
          aria-label="Supplai transfer workflow"
        >
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <li
                className={`lp-step lp-step--${step.tone}`}
                key={step.number}
                data-reveal
                style={{ transitionDelay: `${index * 70}ms` }}
              >
                <span className="lp-step__number" aria-hidden="true">
                  {step.number}
                </span>
                <span className="lp-step__icon" aria-hidden="true">
                  <Icon />
                </span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </li>
            );
          })}
        </ol>

        <p className="lp-section-note">
          <strong>Built for the last mile:</strong> state, LGA, ward, facility,
          rider, and proof context stays connected.
        </p>
      </div>
    </section>
  );
}

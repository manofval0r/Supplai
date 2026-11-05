import SectionHeading from './SectionHeading';
import PhoneMockup from './PhoneMockup';
import {
  BellIcon,
  FileCheckIcon,
  RouteIcon,
  SparkIcon,
} from './icons';

const highlights = [
  {
    icon: RouteIcon,
    title: 'Follow the transfer',
    body: 'A live operations view shows the source facility, rider, destination, and handoff.',
  },
  {
    icon: FileCheckIcon,
    title: 'Keep requests in context',
    body: 'See the medicine, quantity, urgency, ward, and facility need together.',
  },
  {
    icon: BellIcon,
    title: 'Respond before stockouts',
    body: 'Use stock position and unmet requests to prioritize the next movement.',
  },
];

export default function ProductShowcase() {
  return (
    <section
      className="lp-section lp-showcase-section"
      aria-labelledby="lp-showcase-title"
    >
      <div className="lp-container lp-showcase">
        <div className="lp-showcase__copy" data-reveal>
          <SectionHeading
            eyebrow="The operations console"
            title={
              <>
                One clear view
                <br />
                of every movement.
              </>
            }
            description="The Supplai console keeps requests, stock, facilities, riders, and proof in the same place — so operators always know what happens next."
            id="lp-showcase-title"
          />

          <ul className="lp-showcase__list">
            {highlights.map(({ icon: Icon, title, body }) => (
              <li key={title}>
                <span className="lp-showcase__icon" aria-hidden="true">
                  <Icon />
                </span>
                <div>
                  <strong>{title}</strong>
                  <p>{body}</p>
                </div>
              </li>
            ))}
          </ul>

          <p className="lp-showcase__note">
            <SparkIcon aria-hidden="true" />
            Illustrative product preview — final screens may change.
          </p>
        </div>

        <div className="lp-showcase__visual" data-reveal>
          <span className="lp-showcase__label" aria-hidden="true">
            Request. Move. Prove.
          </span>
          <PhoneMockup />
          <span className="lp-sticker lp-showcase__sticker">
            <span className="lp-live-dot" />
            Transfer in progress
          </span>
        </div>
      </div>
    </section>
  );
}

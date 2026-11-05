import SectionHeading from './SectionHeading';
import { QuoteIcon, StarIcon } from './icons';

const testimonials = [
  {
    label: 'Operator perspective 01',
    quote:
      'A shared view of requests and stock gives the team a clearer starting point for every transfer.',
    name: 'Operations team',
    detail: 'Primary healthcare network',
    initials: 'OT',
    tone: 'blue',
  },
  {
    label: 'Operator perspective 02',
    quote:
      'When the rider, destination facility, and delivery status are visible, follow-up becomes faster.',
    name: 'Facility coordinator',
    detail: 'LGA operations',
    initials: 'FC',
    tone: 'green',
  },
  {
    label: 'Operator perspective 03',
    quote:
      'The ledger gives public-health teams a stronger record of where essential stock went.',
    name: 'Supply lead',
    detail: 'Medicine coordination',
    initials: 'SL',
    tone: 'yellow',
  },
];

export default function Testimonials() {
  return (
    <section
      className="lp-section lp-section--canvas"
      aria-labelledby="lp-testimonials-title"
    >
      <div className="lp-container">
        <SectionHeading
          eyebrow="Testimonials"
          title="Built around the people moving stock."
          description="These prototype perspectives reflect the operators, facility coordinators, and supply leads Supplai is designed to support."
          id="lp-testimonials-title"
        />

        <div className="lp-testimonials">
          {testimonials.map((item, index) => (
            <figure
              className={`lp-testimonial lp-testimonial--${item.tone}`}
              key={item.label}
              data-reveal
              style={{ transitionDelay: `${index * 80}ms` }}
            >
              <div className="lp-testimonial__top">
                <span className="lp-placeholder lp-placeholder--solid">
                  {item.label}
                </span>
                <span
                  className="lp-testimonial__stars"
                  role="img"
                  aria-label="Rated 5 out of 5 stars"
                >
                  {Array.from({ length: 5 }, (_, starIndex) => (
                    <StarIcon key={starIndex} />
                  ))}
                </span>
              </div>

              <QuoteIcon className="lp-testimonial__quote-icon" />

              <blockquote>
                <p>{item.quote}</p>
              </blockquote>

              <figcaption>
                <span className="lp-testimonial__avatar" aria-hidden="true">
                  {item.initials}
                </span>
                <span>
                  <strong>{item.name}</strong>
                  <small>{item.detail}</small>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

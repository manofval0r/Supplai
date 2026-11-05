import SectionHeading from './SectionHeading';
import { MailIcon, PlusIcon } from './icons';

const faqs = [
  {
    question: 'What does Supplai coordinate?',
    answer:
      'Supplai coordinates medicine requests, available stock, facility handoffs, riders, and delivery proof across states, LGAs, and wards.',
  },
  {
    question: 'Who is Supplai for?',
    answer:
      'It is designed for public facilities, LGA operators, supply leads, and riders who need a shared view of essential medicine movement.',
  },
  {
    question: 'What happens when a facility is low on stock?',
    answer:
      'The request can be connected to available transferable surplus, assigned to a rider, and tracked through receipt.',
  },
  {
    question: 'What location data is available?',
    answer:
      'The current dataset includes 37 states, 774 LGAs, and 8,811 wards, with facility and ward context available in the dashboard.',
  },
  {
    question: 'What makes a transfer accountable?',
    answer:
      'A transfer has a request, source and destination context, rider status, timestamps, and delivery evidence that can be reviewed.',
  },
  {
    question: 'Is the dashboard live?',
    answer:
      'The current prototype uses live API polling where routes are available and a clearly marked fixture fallback for the remaining surfaces.',
  },
];

export default function Faq() {
  return (
    <section
      className="lp-section lp-section--white"
      id="faq"
      aria-labelledby="lp-faq-title"
    >
      <div className="lp-container lp-faq">
        <div className="lp-faq__intro" data-reveal>
          <SectionHeading
            eyebrow="FAQ"
            title={
              <>
                Logistics questions,
                <br />
                answered clearly.
              </>
            }
            description="Supplai is designed to make the operational picture clear before the next medicine movement begins."
            id="lp-faq-title"
          />

          <div className="lp-faq__support">
            <span className="lp-faq__support-icon" aria-hidden="true">
              <MailIcon />
            </span>
            <div>
              <strong>Need the operations view?</strong>
              <p>
                Open the dashboard to explore the workflow.
              </p>
            </div>
          </div>
        </div>

        <div className="lp-faq__list" data-reveal>
          {faqs.map((faq) => (
            <details className="lp-faq__item" key={faq.question}>
              <summary>
                <span>{faq.question}</span>
                <span className="lp-faq__plus" aria-hidden="true">
                  <PlusIcon />
                </span>
              </summary>
              <div className="lp-faq__answer">
                <p>{faq.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

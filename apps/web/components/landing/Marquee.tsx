import { landingContent } from './content';
import styles from './landing.module.css';

export default function Marquee() {
  const benefits = landingContent.network.benefits;

  return (
    <section
      aria-label="Supplai network benefits"
      className={styles.covered}
      id="our-network"
    >
      <p className={styles.coveredNote}>{landingContent.network.note}</p>
      <div className={styles.marqueeViewport}>
        <div className={styles.marqueeTrack}>
          {benefits.map((benefit, index) => (
            <span className={styles.marqueeChip} key={benefit}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              {benefit}
            </span>
          ))}
          <div aria-hidden="true" className={styles.marqueeDuplicate}>
            {benefits.map((benefit, index) => (
              <span className={styles.marqueeChip} key={benefit}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                {benefit}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

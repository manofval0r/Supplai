import Link from 'next/link';
import { landingContent } from './content';
import HeroScene from './HeroScene';
import styles from './landing.module.css';

export default function Hero() {
  const { hero } = landingContent;

  return (
    <section className={styles.hero}>
      <div className={styles.heroCopy}>
        <p className={styles.eyebrow}>
          <span className={styles.eyebrowDot} aria-hidden="true" />
          {hero.eyebrow}
        </p>
        <h1 className={styles.heroTitle}>
          {hero.headline[0]}
          <span>{hero.headline[1]}</span>
        </h1>
        <p className={styles.heroDescription}>{hero.description}</p>
        <div className={styles.heroActions}>
          <Link className={styles.primaryButton} href="/dashboard">
            {hero.primaryAction} <span aria-hidden="true">→</span>
          </Link>
          <a className={styles.secondaryButton} href="#how-it-works">
            {hero.secondaryAction}
          </a>
        </div>
        <div className={styles.heroProof}>
          <span className={styles.proofMark} aria-hidden="true">
            +
          </span>
          <span>
            <strong>{hero.proofTitle}</strong>
            <small>{hero.proofDescription}</small>
          </span>
        </div>
      </div>
      <HeroScene />
    </section>
  );
}

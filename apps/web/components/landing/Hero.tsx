import Link from 'next/link';
import { landingContent } from './content';
import styles from './landing.module.css';

export default function Hero() {
  const { hero } = landingContent;

  return (
    <section className={styles.hero}>
      <img
        className={styles.hero__scene}
        src="/hero-background.svg"
        alt=""
        aria-hidden="true"
      />
      <div className={styles.hero__ground} aria-hidden="true" />
      <div className={styles.hero__content}>
        <h1 className={styles.heroTitle}>
          {hero.headline[0]}
          <span>{hero.headline[1]}</span>
        </h1>
        <p className={`${styles.hero__sub} ${styles.heroDescription}`}>
          {hero.description}
        </p>
        <div className={styles.heroActions}>
          <Link className={styles.primaryButton} href="/dashboard">
            {hero.primaryAction} <span aria-hidden="true">→</span>
          </Link>
          <a className={styles.secondaryButton} href="#how-it-works">
            {hero.secondaryAction}
          </a>
        </div>
      </div>
    </section>
  );
}

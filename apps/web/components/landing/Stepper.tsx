'use client';

import { useEffect, useState } from 'react';
import { landingContent } from './content';
import styles from './landing.module.css';

export default function Stepper() {
  const { howItWorks } = landingContent;
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const motionPreference = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    );
    if (motionPreference.matches) return;

    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % howItWorks.steps.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [howItWorks.steps.length]);

  const currentStep = howItWorks.steps[activeIndex];
  const moveStep = (direction: number) => {
    setActiveIndex(
      (index) =>
        (index + direction + howItWorks.steps.length) % howItWorks.steps.length,
    );
  };

  return (
    <section
      aria-labelledby="how-it-works-title"
      className={styles.stepperSection}
      id="how-it-works"
    >
      <div className={styles.stepperIntro}>
        <p className={styles.eyebrow}>
          <span className={styles.eyebrowDot} aria-hidden="true" />
          {howItWorks.eyebrow}
        </p>
        <h2 className={styles.sectionTitle} id="how-it-works-title">
          {howItWorks.headline[0]}
          <span>{howItWorks.headline[1]}</span>
        </h2>
        <p className={styles.sectionDescription}>{howItWorks.description}</p>
      </div>

      <div className={styles.stepper}>
        <div className={styles.stepperTop}>
          <span>{currentStep.number}</span>
          <div className={styles.stepperControls}>
            <button
              aria-label="Previous step"
              onClick={() => moveStep(-1)}
              type="button"
            >
              ←
            </button>
            <button
              aria-label="Next step"
              onClick={() => moveStep(1)}
              type="button"
            >
              →
            </button>
          </div>
        </div>
        <div aria-live="polite" className={styles.stepperCopy}>
          <h3>{currentStep.title}</h3>
          <p>{currentStep.body}</p>
        </div>
        <div
          aria-label={`Step ${activeIndex + 1} of ${howItWorks.steps.length}`}
          className={styles.stepperProgress}
        >
          {howItWorks.steps.map((step, index) => (
            <span
              aria-current={activeIndex === index ? 'step' : undefined}
              className={activeIndex === index ? styles.stepActive : ''}
              key={step.number}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

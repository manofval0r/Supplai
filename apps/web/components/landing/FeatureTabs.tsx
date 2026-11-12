'use client';

import { useState, type KeyboardEvent } from 'react';
import { landingContent } from './content';
import styles from './landing.module.css';

export default function FeatureTabs() {
  const [activeIndex, setActiveIndex] = useState(0);
  const features = landingContent.facilityApp.features;
  const featureDetails = landingContent.facilityApp.featureDetails;

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    let nextIndex: number;

    if (event.key === 'ArrowRight') {
      nextIndex = (activeIndex + 1) % features.length;
    } else if (event.key === 'ArrowLeft') {
      nextIndex = (activeIndex - 1 + features.length) % features.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = features.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    setActiveIndex(nextIndex);
    document.getElementById(`landing-feature-tab-${nextIndex}`)?.focus();
  }

  return (
    <section
      aria-label="Facility app features"
      className={styles.featureSection}
    >
      <div className={styles.featureTabs} role="tablist">
        {features.map((feature, index) => (
          <button
            aria-controls="landing-feature-panel"
            aria-selected={activeIndex === index}
            className={`${styles.featureTab} ${activeIndex === index ? styles.featureTabActive : ''}`}
            id={`landing-feature-tab-${index}`}
            key={feature}
            onClick={() => setActiveIndex(index)}
            onKeyDown={handleKeyDown}
            role="tab"
            tabIndex={activeIndex === index ? 0 : -1}
            type="button"
          >
            <span className={styles.featureTabNumber}>
              {String(index + 1).padStart(2, '0')}
            </span>
            <span>{feature}</span>
            <span className={styles.featureTabArrow} aria-hidden="true">
              ↗
            </span>
          </button>
        ))}
      </div>
      <div
        aria-labelledby={`landing-feature-tab-${activeIndex}`}
        className={styles.featurePanel}
        id="landing-feature-panel"
        role="tabpanel"
        tabIndex={0}
      >
        <p>{featureDetails[activeIndex]}</p>
      </div>
    </section>
  );
}

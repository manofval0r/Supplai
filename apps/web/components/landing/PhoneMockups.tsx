import Image from 'next/image';
import Link from 'next/link';
import AppPreview3D from '../AppPreview3D';
import { landingContent } from './content';
import styles from './landing.module.css';
import { PREVIEW_SCREENS } from './preview-screens';
import { DEFAULT_EXPO_PREVIEW_URL } from '../../lib/drive-preview';

const EXPO_PREVIEW_URL =
  process.env.NEXT_PUBLIC_EXPO_PREVIEW_URL ?? DEFAULT_EXPO_PREVIEW_URL;

export default function PhoneMockups() {
  const { facilityApp } = landingContent;

  return (
    <section
      aria-labelledby="facility-app-title"
      className={styles.phoneSection}
      id="app-preview"
    >
      <div className={styles.phoneCopy}>
        <p className={styles.eyebrow}>
          <span className={styles.eyebrowDot} aria-hidden="true" />
          {facilityApp.eyebrow}
        </p>
        <h2 className={styles.sectionTitle} id="facility-app-title">
          {facilityApp.headline}
        </h2>
        <p className={styles.sectionDescription}>{facilityApp.description}</p>
        <ul className={styles.appFeatures}>
          {facilityApp.features.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
        <div className={styles.phoneActions}>
          <a
            className={`${styles.primaryButton} ${styles.downloadButton}`}
            href={EXPO_PREVIEW_URL}
            rel="noreferrer"
            target="_blank"
          >
            Download the latest Expo preview{' '}
            <span aria-hidden="true">{'\u2192'}</span>
          </a>
          <Link
            className={`${styles.primaryButton} ${styles.downloadButton}`}
            href="/app-preview"
          >
            Open full App Preview &amp; Videos
          </Link>
        </div>
        <p className={styles.phoneNote}>
          Android preview build. All facilities, stock, and deliveries are
          fictional.
        </p>
      </div>
      <div className={styles.phoneVisuals}>
        <AppPreview3D />
      </div>
      <div
        aria-label="Facility app screens"
        className={styles.phoneRail}
        role="region"
        tabIndex={0}
      >
        {PREVIEW_SCREENS.map((screen) => (
          <figure className={styles.phoneTile} key={screen.id}>
            <div className={styles.phoneTileScreen}>
              <Image
                alt={`Supplai app ${screen.label} screen`}
                fill
                sizes="(max-width: 640px) 140px, 160px"
                src={screen.src}
              />
            </div>
            <figcaption>{screen.label}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

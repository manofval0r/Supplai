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
        <p className={styles.eyebrow}>{facilityApp.eyebrow}</p>
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
            className={styles.downloadButton}
            href={EXPO_PREVIEW_URL}
            rel="noreferrer"
            target="_blank"
          >
            Download Latest Expo APK <span aria-hidden="true">→</span>
          </a>
          <Link className={styles.previewSecondaryButton} href="/app-preview">
            Full App Preview &amp; Videos
          </Link>
        </div>
        <p className={styles.phoneNote}>
          Android preview build (`5a2d041e`). All facilities, stock, and
          deliveries are fictional.
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
          <Link
            className={styles.phoneTile}
            href="/app-preview#screens"
            key={screen.id}
          >
            <figure className={styles.phoneTileFigure}>
              <div className={styles.phoneTileScreen}>
                <img
                  alt={`Supplai app ${screen.label} screen`}
                  loading="eager"
                  src={screen.src}
                />
              </div>
              <figcaption>
                <strong>{screen.label}</strong>
              </figcaption>
            </figure>
          </Link>
        ))}
      </div>
    </section>
  );
}

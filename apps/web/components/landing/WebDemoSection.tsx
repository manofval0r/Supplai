import Link from 'next/link';
import {
  DEFAULT_DRIVE_FOLDER_URL,
  WEB_DEMO_VIDEO,
} from '../../lib/drive-preview';
import styles from './landing.module.css';

export default function WebDemoSection() {
  return (
    <section
      id="web-demo"
      className={styles.demoSection}
      aria-labelledby="web-demo-heading"
    >
      <div className={styles.demoHeader}>
        <div>
          <p className={styles.sectionEyebrow}>Live walkthrough</p>
          <h2 id="web-demo-heading" className={styles.sectionTitle}>
            See Supplai Web in action
          </h2>
          <p className={styles.sectionDescription}>
            Watch a full request, source confirmation, FEFO dispatch, and LGA
            oversight handoff on the web console.
          </p>
        </div>

        <div className={styles.demoActions}>
          <Link className={styles.demoPrimaryBtn} href="/dashboard">
            Open console <span aria-hidden="true">→</span>
          </Link>
          <a
            className={styles.demoSecondaryBtn}
            href={DEFAULT_DRIVE_FOLDER_URL}
            rel="noreferrer"
            target="_blank"
          >
            Drive folder <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>

      <div className={styles.demoFrameCard}>
        <div className={styles.demoFrameRatio}>
          <iframe
            allow="autoplay; encrypted-media"
            allowFullScreen
            loading="lazy"
            src={WEB_DEMO_VIDEO.embedUrl}
            title={WEB_DEMO_VIDEO.title}
          />
        </div>
        <div className={styles.demoFrameBar}>
          <span>{WEB_DEMO_VIDEO.title}</span>
          <a href={WEB_DEMO_VIDEO.viewUrl} rel="noreferrer" target="_blank">
            Open in Drive ↗
          </a>
        </div>
      </div>
    </section>
  );
}

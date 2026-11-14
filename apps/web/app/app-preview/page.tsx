import type { Metadata } from 'next';
import Link from 'next/link';
import AppPreview3D from '../../components/AppPreview3D';
import PageHero from '../../components/landing/PageHero';
import SiteShell from '../../components/landing/SiteShell';
import { PREVIEW_SCREENS } from '../../components/landing/preview-screens';
import {
  buildDriveFolderEmbedUrl,
  DEFAULT_EXPO_PREVIEW_URL,
  parseDriveFolderId,
  parseDriveVideoList,
} from '../../lib/drive-preview';
import styles from './app-preview.module.css';

export const metadata: Metadata = {
  title: 'App Preview & APK | Supplai',
  description:
    'Explore high-fidelity Supplai mobile app mockups, live Google Drive video walkthroughs, and download the latest Expo Android preview build.',
};

const BUILD_FACTS = [
  { label: 'Channel', value: 'EAS Preview' },
  { label: 'Runtime', value: '0.1.0 · SDK 58' },
  { label: 'Commit', value: 'b8dd3fa6' },
  { label: 'Guardrail', value: 'ORS & Zinc' },
];

const SOON = [
  { title: 'Request to release', note: 'A clinic asks, a custodian confirms.' },
  { title: 'Rider dispatch', note: 'Pickup, live route, and seal check.' },
  { title: 'PIN-verified receipt', note: 'The handover closes on both sides.' },
];

export default function AppPreviewPage() {
  const expoPreviewUrl =
    process.env.NEXT_PUBLIC_EXPO_PREVIEW_URL ?? DEFAULT_EXPO_PREVIEW_URL;
  const folderId = parseDriveFolderId(
    process.env.NEXT_PUBLIC_DRIVE_PREVIEW_FOLDER_ID,
  );
  const driveVideos = parseDriveVideoList(
    process.env.NEXT_PUBLIC_DRIVE_PREVIEW_VIDEOS,
  );

  return (
    <SiteShell>
      <PageHero
        eyebrow="Android preview build · demo data"
        title={
          <>
            The field companion for <em>clinic logistics.</em>
          </>
        }
        description="Inspect real Expo SDK 58 screen captures, rotate the interactive 3D mockup, or install the verified Android preview build."
        chips={BUILD_FACTS}
        actions={
          <>
            <a
              className={styles.btnLime}
              href={expoPreviewUrl}
              rel="noreferrer"
              target="_blank"
            >
              Download latest APK <span aria-hidden="true">→</span>
            </a>
            <Link className={styles.btnGhost} href="/dashboard">
              Open web console
            </Link>
          </>
        }
        visual={
          <div className={styles.phone3d}>
            <AppPreview3D />
          </div>
        }
      />

      <div className={styles.wrap}>
        <section id="screens" style={{ scrollMarginTop: 108 }}>
          <div className={styles.sectionHead}>
            <div>
              <p className={styles.kicker}>Captured from a Pixel 9a build</p>
              <h2>Six screens, one verified workflow.</h2>
            </div>
            <Link className={styles.pillLink} href="/lga">
              See the LGA oversight desk →
            </Link>
          </div>

          <div className={styles.gallery}>
            {PREVIEW_SCREENS.map((screen) => (
              <figure className={styles.shot} key={screen.id}>
                <div className={styles.screen}>
                  <img
                    alt={`Supplai app ${screen.label} screen`}
                    loading="eager"
                    src={screen.src}
                  />
                </div>
                <figcaption>
                  <span className={styles.role}>{screen.role}</span>
                  <h3>{screen.label}</h3>
                  <p>{screen.caption}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className={styles.videos}>
          <div className={styles.sectionHead}>
            <div>
              <p className={styles.kicker}>Walkthroughs</p>
              <h2>Watch a handover happen.</h2>
            </div>
            <p className={styles.sub}>
              Short recordings of the app running the full request, release,
              dispatch, and receipt flow.
            </p>
          </div>

          {driveVideos.length > 0 ? (
            <div className={styles.videoGrid}>
              {driveVideos.map((video) => (
                <div className={styles.video} key={video.id}>
                  <iframe
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    src={video.embedUrl}
                    title={video.title}
                  />
                  <div className={styles.videoMeta}>
                    <span>{video.title}</span>
                    <a href={video.viewUrl} rel="noreferrer" target="_blank">
                      Open in Drive ↗
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {folderId ? (
            <div className={styles.folder}>
              <iframe
                src={buildDriveFolderEmbedUrl(folderId)}
                title="Supplai Google Drive Live Previews Folder"
              />
            </div>
          ) : driveVideos.length === 0 ? (
            <div className={styles.soon}>
              {SOON.map((item) => (
                <div className={styles.soonCard} key={item.title}>
                  <span className={styles.play} aria-hidden="true">
                    ▶
                  </span>
                  <b>{item.title}</b>
                  <span>{item.note} Recording coming soon.</span>
                </div>
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </SiteShell>
  );
}

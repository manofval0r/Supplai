import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import AppPreview3D from '../../components/AppPreview3D';
import { PREVIEW_SCREENS } from '../../components/landing/preview-screens';
import {
  buildDriveFolderEmbedUrl,
  DEFAULT_EXPO_PREVIEW_URL,
  parseDriveFolderId,
  parseDriveVideoList,
} from '../../lib/drive-preview';

export const metadata: Metadata = {
  title: 'App Preview & APK | Supplai',
  description:
    'Explore high-fidelity Supplai mobile app mockups, live Google Drive video walkthroughs, and download the latest Expo Android preview build.',
};

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
    <main className="site-page" style={{ paddingBottom: 72 }}>
      <header className="site-header">
        <Link className="site-brand" href="/">
          <span className="brand-mark">+</span>
          <span>supplai</span>
        </Link>
        <nav aria-label="App preview navigation" className="site-nav">
          <Link href="/dashboard">Console</Link>
          <Link href="/lga">LGA Desk</Link>
          <Link
            href="/app-preview"
            style={{ color: '#1558C9', fontWeight: 700 }}
          >
            App Preview
          </Link>
        </nav>
      </header>

      <section
        style={{
          width: 'min(100% - 32px, 1180px)',
          margin: '36px auto 0',
          display: 'grid',
          gap: 36,
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 28,
            alignItems: 'center',
            background: '#f2f4f8',
            borderRadius: 24,
            padding: '28px 24px',
          }}
        >
          <div>
            <p
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 0.8,
                color: '#1558C9',
                textTransform: 'uppercase',
                margin: '0 0 8px',
              }}
            >
              Android Preview Build · Demo Data
            </p>
            <h1
              style={{
                fontSize: 'clamp(28px, 4vw, 40px)',
                fontWeight: 800,
                letterSpacing: -1,
                margin: '0 0 12px',
                color: '#030407',
              }}
            >
              Supplai Mobile App Preview
            </h1>
            <p
              style={{
                fontSize: 15,
                lineHeight: 1.6,
                color: '#646f82',
                margin: '0 0 22px',
              }}
            >
              Inspect the high-fidelity facility, rider, and Scenario Lab
              screens, watch live walkthrough videos from our shared Drive
              folder, or install the latest EAS Android preview APK directly on
              your device.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <a
                href={expoPreviewUrl}
                rel="noreferrer"
                target="_blank"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  height: 48,
                  padding: '0 20px',
                  borderRadius: 16,
                  background: '#1558C9',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: 14,
                  textDecoration: 'none',
                }}
              >
                Download Latest Expo APK →
              </a>
              <Link
                href="/dashboard"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  height: 48,
                  padding: '0 18px',
                  borderRadius: 16,
                  background: '#ffffff',
                  border: '1px solid #e6e9ef',
                  color: '#030407',
                  fontWeight: 600,
                  fontSize: 14,
                  textDecoration: 'none',
                }}
              >
                Open Interactive Web Console
              </Link>
            </div>
            <p style={{ fontSize: 12, color: '#646f82', marginTop: 14 }}>
              All facilities, stock levels, and courier routes shown are
              fictional scenario data for demonstration.
            </p>
          </div>

          <div style={{ minHeight: 360 }}>
            <AppPreview3D />
          </div>
        </div>

        <div>
          <h2
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: '#030407',
              margin: '0 0 14px',
            }}
          >
            High-Fidelity Screen Mockups
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: 16,
            }}
          >
            {PREVIEW_SCREENS.map((screen) => (
              <figure
                key={screen.id}
                style={{
                  margin: 0,
                  background: '#f2f4f8',
                  borderRadius: 18,
                  padding: 12,
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '9 / 19',
                    borderRadius: 14,
                    overflow: 'hidden',
                    background: '#030407',
                  }}
                >
                  <Image
                    alt={`Supplai app ${screen.label} screen`}
                    fill
                    sizes="(max-width: 640px) 160px, 200px"
                    src={screen.src}
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <figcaption
                  style={{
                    marginTop: 10,
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#030407',
                  }}
                >
                  {screen.label}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>

        <div>
          <h2
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: '#030407',
              margin: '0 0 8px',
            }}
          >
            Live Video Walkthroughs (Google Drive)
          </h2>
          <p style={{ fontSize: 14, color: '#646f82', margin: '0 0 16px' }}>
            Streamed directly from the shared Google Drive preview folder.
          </p>

          {driveVideos.length > 0 ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: 16,
                marginBottom: folderId ? 20 : 0,
              }}
            >
              {driveVideos.map((video) => (
                <div
                  key={video.id}
                  style={{
                    background: '#f2f4f8',
                    borderRadius: 18,
                    padding: 14,
                  }}
                >
                  <iframe
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    src={video.embedUrl}
                    style={{
                      width: '100%',
                      aspectRatio: '16 / 9',
                      border: 0,
                      borderRadius: 12,
                      background: '#030407',
                    }}
                    title={video.title}
                  />
                  <div
                    style={{
                      marginTop: 10,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: 13.5,
                      fontWeight: 700,
                      color: '#030407',
                    }}
                  >
                    <span>{video.title}</span>
                    <a
                      href={video.viewUrl}
                      rel="noreferrer"
                      target="_blank"
                      style={{ color: '#1558C9', textDecoration: 'none' }}
                    >
                      Open in Drive ↗
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {folderId ? (
            <div
              style={{
                background: '#f2f4f8',
                borderRadius: 20,
                padding: 14,
              }}
            >
              <iframe
                src={buildDriveFolderEmbedUrl(folderId)}
                style={{
                  width: '100%',
                  height: 440,
                  border: 0,
                  borderRadius: 14,
                  background: '#ffffff',
                }}
                title="Supplai Google Drive Live Previews Folder"
              />
            </div>
          ) : driveVideos.length === 0 ? (
            <div
              style={{
                background: '#f2f4f8',
                borderRadius: 18,
                padding: 20,
                color: '#646f82',
                fontSize: 13.5,
              }}
            >
              Google Drive preview folder not configured yet. Set{' '}
              <code>NEXT_PUBLIC_DRIVE_PREVIEW_FOLDER_ID</code> (folder ID or
              URL) or <code>NEXT_PUBLIC_DRIVE_PREVIEW_VIDEOS</code> to render
              live walkthrough videos here.
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import AppPreview3D from '../../components/AppPreview3D';
import SiteShell from '../../components/landing/SiteShell';
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

const BUILD_FACTS = [
  { label: 'Channel', value: 'EAS Preview' },
  { label: 'Runtime', value: '0.1.0 · SDK 58' },
  { label: 'Commit Ref', value: 'b8dd3fa6 APK' },
  { label: 'Guardrail', value: 'Ambient ORS & Zinc' },
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
      <section
        style={{
          width: 'min(95%, 1240px)',
          margin: '28px auto 0',
          display: 'grid',
          gap: 36,
        }}
      >
        {/* Flagship Midnight Black Hero Stage */}
        <div
          style={{
            position: 'relative',
            overflow: 'hidden',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 28,
            alignItems: 'center',
            background: '#030407',
            color: '#ffffff',
            border: '3px solid #030407',
            borderRadius: 30,
            boxShadow: '6px 6px 0 #1558C9',
            padding: 'clamp(24px, 4vw, 44px)',
          }}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 800 300"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              opacity: 0.14,
              pointerEvents: 'none',
            }}
          >
            <path
              d="M0 240 H220 L270 160 H470 L530 210 H800"
              fill="none"
              stroke="#1558C9"
              strokeWidth="4"
            />
            <circle cx="270" cy="160" r="8" fill="#D4FF24" />
            <circle cx="470" cy="160" r="8" fill="#D4FF24" />
            <path
              d="M270 160 Q370 70 470 160"
              fill="none"
              stroke="#D4FF24"
              strokeWidth="3"
              strokeDasharray="9 8"
            />
          </svg>

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 12px',
                borderRadius: 999,
                background: '#1558C9',
                border: '1.5px solid #D4FF24',
                color: '#D4FF24',
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: 0.8,
                textTransform: 'uppercase',
                marginBottom: 14,
              }}
            >
              Android Preview Build · Demo Data
            </div>

            <h1
              style={{
                fontSize: 'clamp(32px, 4.5vw, 48px)',
                fontWeight: 800,
                letterSpacing: -1.4,
                lineHeight: 1.02,
                margin: '0 0 14px',
                color: '#ffffff',
              }}
            >
              The mobile field companion for clinic logistics.
            </h1>

            <p
              style={{
                fontSize: 15,
                lineHeight: 1.6,
                color: 'rgba(255, 255, 255, 0.78)',
                margin: '0 0 20px',
              }}
            >
              Inspect real Expo SDK 58 screen captures, rotate the interactive
              3D mockup, watch Google Drive flow walkthroughs, or install the
              verified Android preview APK.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: 10,
                marginBottom: 22,
              }}
            >
              {BUILD_FACTS.map((fact) => (
                <div
                  key={fact.label}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 14,
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.16)',
                  }}
                >
                  <div
                    style={{
                      fontSize: 10.5,
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: 0.6,
                      color: '#D4FF24',
                    }}
                  >
                    {fact.label}
                  </div>
                  <div
                    style={{
                      fontSize: 13.5,
                      fontWeight: 700,
                      color: '#ffffff',
                      marginTop: 2,
                    }}
                  >
                    {fact.value}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <a
                href={expoPreviewUrl}
                rel="noreferrer"
                target="_blank"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  height: 48,
                  padding: '0 22px',
                  borderRadius: 999,
                  background: '#D4FF24',
                  border: '2px solid #D4FF24',
                  color: '#030407',
                  fontWeight: 800,
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
                  padding: '0 20px',
                  borderRadius: 999,
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: 14,
                  textDecoration: 'none',
                }}
              >
                Open Web Console
              </Link>
            </div>
            <p
              style={{
                fontSize: 12,
                color: 'rgba(255,255,255,0.62)',
                marginTop: 14,
                marginBottom: 0,
              }}
            >
              All facilities, stock balances, and courier routes shown are
              fictional scenario data for demonstration.
            </p>
          </div>

          <div style={{ minHeight: 380, position: 'relative', zIndex: 1 }}>
            <AppPreview3D />
          </div>
        </div>

        {/* Verified Android Screen Gallery */}
        <div id="screens" style={{ scrollMarginTop: 108 }}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              gap: 12,
              marginBottom: 18,
            }}
          >
            <div>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: 0.9,
                  color: '#1558C9',
                  textTransform: 'uppercase',
                  margin: '0 0 6px',
                }}
              >
                Captured From Pixel 9a Preview Build
              </p>
              <h2
                style={{
                  fontSize: 'clamp(24px, 3vw, 32px)',
                  fontWeight: 800,
                  letterSpacing: -0.8,
                  color: '#030407',
                  margin: 0,
                }}
              >
                Verified Mobile Workflows
              </h2>
            </div>
            <Link
              href="/lga"
              style={{
                padding: '8px 16px',
                borderRadius: 999,
                border: '2px solid #030407',
                background: '#D4FF24',
                color: '#030407',
                fontWeight: 800,
                fontSize: 12.5,
                textDecoration: 'none',
              }}
            >
              Inspect LGA Oversight Sync →
            </Link>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 18,
            }}
          >
            {PREVIEW_SCREENS.map((screen) => (
              <figure
                key={screen.id}
                style={{
                  margin: 0,
                  background: '#ffffff',
                  border: '2.5px solid #030407',
                  borderRadius: 22,
                  boxShadow: '4px 4px 0 #030407',
                  padding: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: '100%',
                    aspectRatio: '9 / 19.5',
                    borderRadius: 14,
                    overflow: 'hidden',
                    border: '2px solid #030407',
                    background: '#030407',
                  }}
                >
                  <img
                    alt={`Supplai app ${screen.label} screen`}
                    loading="eager"
                    src={screen.src}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                </div>
                <figcaption>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: 999,
                      background: '#e9f0fd',
                      color: '#1558C9',
                      fontSize: 10.5,
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: 0.4,
                      marginBottom: 4,
                    }}
                  >
                    {screen.role}
                  </span>
                  <div
                    style={{
                      fontSize: 14.5,
                      fontWeight: 800,
                      color: '#030407',
                    }}
                  >
                    {screen.label}
                  </div>
                  <p
                    style={{
                      margin: '4px 0 0',
                      fontSize: 12,
                      lineHeight: 1.45,
                      color: '#646f82',
                    }}
                  >
                    {screen.caption}
                  </p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>

        {/* Live Video Walkthroughs */}
        <div
          style={{
            background: '#f2f4f8',
            border: '2.5px solid #030407',
            borderRadius: 24,
            boxShadow: '5px 5px 0 #030407',
            padding: 'clamp(20px, 3vw, 32px)',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              marginBottom: 14,
            }}
          >
            <div>
              <span
                style={{
                  display: 'inline-block',
                  padding: '4px 10px',
                  borderRadius: 999,
                  background: '#D4FF24',
                  border: '1.5px solid #030407',
                  color: '#030407',
                  fontSize: 11,
                  fontWeight: 800,
                  marginBottom: 8,
                }}
              >
                GOOGLE DRIVE WALKTHROUGHS
              </span>
              <h2
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: '#030407',
                  margin: 0,
                }}
              >
                Live Video Previews &amp; Recordings
              </h2>
            </div>
            <p style={{ fontSize: 13.5, color: '#646f82', margin: 0 }}>
              Streamed from our shared Google Drive preview folder.
            </p>
          </div>

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
                    background: '#ffffff',
                    border: '2px solid #030407',
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
                background: '#ffffff',
                border: '2px solid #030407',
                borderRadius: 20,
                padding: 12,
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
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                gap: 16,
                alignItems: 'center',
                background: '#ffffff',
                border: '2px dashed #1558C9',
                borderRadius: 18,
                padding: 20,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: '#1558C9',
                  color: '#D4FF24',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 20,
                  fontWeight: 800,
                }}
                aria-hidden="true"
              >
                ▶
              </div>
              <div
                style={{ fontSize: 13.5, color: '#030407', lineHeight: 1.55 }}
              >
                <strong>Ready for shared Drive folder playback.</strong> Set{' '}
                <code>NEXT_PUBLIC_DRIVE_PREVIEW_FOLDER_ID</code> (Google Drive
                folder ID or share URL) or{' '}
                <code>NEXT_PUBLIC_DRIVE_PREVIEW_VIDEOS</code> to embed
                walkthrough recordings directly in this gallery.
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </SiteShell>
  );
}

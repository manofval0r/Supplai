export interface DriveVideoItem {
  id: string;
  title: string;
  embedUrl: string;
  viewUrl: string;
}

export const DEFAULT_EXPO_PREVIEW_URL =
  'https://expo.dev/artifacts/eas/vPPJ-HyC5LHMOn0leohpKOA57YvgOCbXqbYx2xcJeUU.apk';

export const DEFAULT_DRIVE_FOLDER_ID = '11i1V9V2tsCLjAcRFSxF6UOwSOPzo_3e8';
export const DEFAULT_DRIVE_FOLDER_URL = `https://drive.google.com/drive/folders/${DEFAULT_DRIVE_FOLDER_ID}`;

export const WEB_DEMO_VIDEO: DriveVideoItem = {
  id: '1URiKjIOjfZYxUqu6VKF3_S3d_CeK5Zte',
  title: 'Supplai Web Console Demo',
  embedUrl:
    'https://drive.google.com/file/d/1URiKjIOjfZYxUqu6VKF3_S3d_CeK5Zte/preview',
  viewUrl:
    'https://drive.google.com/file/d/1URiKjIOjfZYxUqu6VKF3_S3d_CeK5Zte/view',
};

export const APP_DEMO_VIDEO: DriveVideoItem = {
  id: '1f1X8dsvrG7VEYDlE54WOIi95vXy4HNBt',
  title: 'Supplai Mobile App Demo',
  embedUrl:
    'https://drive.google.com/file/d/1f1X8dsvrG7VEYDlE54WOIi95vXy4HNBt/preview',
  viewUrl:
    'https://drive.google.com/file/d/1f1X8dsvrG7VEYDlE54WOIi95vXy4HNBt/view',
};

/**
 * Extracts a Google Drive folder ID from either a raw ID or a full Drive folder URL.
 */
export function parseDriveFolderId(raw?: string | null): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const match = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (match?.[1]) return match[1];
  return /^[a-zA-Z0-9_-]{10,}$/.test(trimmed) ? trimmed : null;
}

/**
 * Builds an embeddable Google Drive folder grid URL for live video/asset browsing.
 */
export function buildDriveFolderEmbedUrl(folderId: string): string {
  return `https://drive.google.com/embeddedfolderview?id=${encodeURIComponent(folderId)}#grid`;
}

/**
 * Parses comma-separated `fileId|Title` entries from NEXT_PUBLIC_DRIVE_PREVIEW_VIDEOS.
 */
export function parseDriveVideoList(raw?: string | null): DriveVideoItem[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry, idx) => {
      const [idPart, titlePart] = entry.split('|').map((s) => s.trim());
      const idMatch = idPart?.match(/\/d\/([a-zA-Z0-9_-]+)/);
      const id = idMatch?.[1] ?? idPart ?? '';
      if (!id) return null;
      return {
        id,
        title: titlePart || `Live App Preview ${idx + 1}`,
        embedUrl: `https://drive.google.com/file/d/${encodeURIComponent(id)}/preview`,
        viewUrl: `https://drive.google.com/file/d/${encodeURIComponent(id)}/view`,
      };
    })
    .filter((item): item is DriveVideoItem => item !== null);
}

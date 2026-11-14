import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildLgaDecisionQueue, loadLgaDecisionData } from '../lib/api';
import {
  buildDriveFolderEmbedUrl,
  parseDriveFolderId,
  parseDriveVideoList,
} from '../lib/drive-preview';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('/lga decision surface data & fallback', () => {
  it('falls back to clearly labelled fixture data when the API is unreachable', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('ECONNREFUSED')),
    );

    const bundle = await loadLgaDecisionData();
    expect(bundle.source).toBe('fixture');
    expect(bundle.overview.lgaCode).toBe('ADO-OTA-LGA');
    expect(bundle.queue.length).toBeGreaterThan(0);
    expect(bundle.failures.length).toBeGreaterThan(0);
    expect(bundle.queue[0]?.attentionReason).toBeTruthy();
    expect(bundle.queue[0]?.nextOwner).toBeTruthy();
    expect(bundle.queue[0]?.safetyFloorEvidence).toBeTruthy();
  });

  it('prioritizes proof_locked and pending/confirmed transfers in queue', () => {
    const queue = buildLgaDecisionQueue(
      [
        {
          id: '11111111-1111-4111-8111-111111111111',
          reference: 'SUP-901',
          fromFacility: 'Idera PHC',
          toFacility: 'Sango PHC',
          drug: 'ORS',
          quantity: 20,
          status: 'dispatched',
          createdAt: '2026-11-14T10:00:00.000Z',
        },
        {
          id: '11111111-1111-4111-8111-111111111112',
          reference: 'SUP-902',
          fromFacility: 'Ota Post',
          toFacility: 'Aiyetoro PHC',
          drug: 'Zinc',
          quantity: 10,
          status: 'pending',
          createdAt: '2026-11-14T10:05:00.000Z',
        },
      ],
      [
        {
          id: '22222222-2222-4222-8222-222222222222',
          category: 'proof_locked',
          reference: 'SUP-901',
          occurredAt: '2026-11-14T10:15:00.000Z',
          detail: 'PIN mismatch at handover.',
        },
      ],
    );

    expect(queue[0]?.priority).toBe('critical');
    expect(queue[0]?.attentionReason).toBe('PIN mismatch at handover.');
    expect(queue[1]?.priority).toBe('attention');
    expect(queue[1]?.nextOwner).toBe('LGA Dispatch / Source Custodian');
  });
});

describe('/app-preview Google Drive folder & video helpers', () => {
  it('parses raw folder IDs and full Google Drive folder URLs', () => {
    expect(parseDriveFolderId('1AbCdEfGhIjKlMnOpQrStUvWxYz')).toBe(
      '1AbCdEfGhIjKlMnOpQrStUvWxYz',
    );
    expect(
      parseDriveFolderId(
        'https://drive.google.com/drive/folders/1AbCdEfGhIjKlMnOpQrStUvWxYz?usp=sharing',
      ),
    ).toBe('1AbCdEfGhIjKlMnOpQrStUvWxYz');
    expect(parseDriveFolderId('')).toBeNull();
  });

  it('builds embedded folder view URL and parses video entries', () => {
    expect(buildDriveFolderEmbedUrl('1AbCdEfGhIjKlMnOp')).toBe(
      'https://drive.google.com/embeddedfolderview?id=1AbCdEfGhIjKlMnOp#grid',
    );

    const videos = parseDriveVideoList(
      'https://drive.google.com/file/d/1FileAlpha12345/view|Facility Flow, 1FileBeta67890|Rider Handover',
    );
    expect(videos).toHaveLength(2);
    expect(videos[0]).toEqual({
      id: '1FileAlpha12345',
      title: 'Facility Flow',
      embedUrl: 'https://drive.google.com/file/d/1FileAlpha12345/preview',
      viewUrl: 'https://drive.google.com/file/d/1FileAlpha12345/view',
    });
    expect(videos[1]?.title).toBe('Rider Handover');
  });
});

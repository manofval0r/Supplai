import { afterEach, describe, expect, it, vi } from 'vitest';
import { supplaiApi } from '../lib/api';
import {
  registerForRemoteNotificationsAsync,
  scheduleCriticalAlert,
} from '../lib/notifications';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('supplaiApi web client', () => {
  it('fetches order detail on populated 200 response', async () => {
    const mockOrder = {
      reference: 'REQ-0001',
      status: 'awaiting_source_confirmation',
      commodity: 'ors',
      quantity: 20,
      sourceFacility: 'Demo PHC B',
      requestingFacility: 'Aiyetoro Central',
      transferReference: null,
      evidence: {
        commodity: 'ors',
        batchNumber: 'B209',
        expiresOn: '2027-10-01',
        inspectedAt: '2026-11-14T10:00:00Z',
        condition: 'Sealed ambient crate',
        ambientOnly: true,
        quantityOnHand: 80,
        safetyFloor: 20,
        quantityRequested: 20,
      },
      timeline: [],
      allowedActions: ['confirm'],
      nextAccountableOwner: 'Demo PHC B Custodian',
    };

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockOrder),
      }),
    );

    const result = await supplaiApi.getOrder('REQ-0001');
    expect(result.reference).toBe('REQ-0001');
    expect(result.evidence.ambientOnly).toBe(true);
  });

  it('throws SupplaiApiError with server message on non-OK response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'Safety floor breach' }),
      }),
    );

    await expect(supplaiApi.getOrder('REQ-0400')).rejects.toThrow(
      'Safety floor breach',
    );
  });

  it('surfaces network failures cleanly so UI can fall back to fixtures', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('ECONNREFUSED')),
    );

    await expect(supplaiApi.notifications({ role: 'lga' })).rejects.toThrow(
      'ECONNREFUSED',
    );
  });
});

describe('web notifications fallback', () => {
  it('returns false when window/Notification is unavailable', async () => {
    await expect(registerForRemoteNotificationsAsync()).resolves.toBe(false);
    await expect(
      scheduleCriticalAlert({ title: 'Test', body: 'Fallback' }),
    ).resolves.toBeUndefined();
  });
});

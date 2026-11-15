import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  clearWorkspaceSession,
  getWorkspaceSession,
  signInWorkspace,
  signUpWorkspace,
} from '../lib/auth';

function mockBrowserStorage() {
  const store = new Map<string, string>();
  const localStorage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
  };
  const doc = { cookie: '' };
  vi.stubGlobal('window', { localStorage });
  vi.stubGlobal('document', doc);
  return { store, doc };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('workspace auth gate', () => {
  it('returns null safely when running without window (SSR)', () => {
    expect(getWorkspaceSession()).toBeNull();
  });

  it('rejects invalid email and short passwords on sign in', async () => {
    const badEmail = await signInWorkspace('invalid-email', 'secret123');
    expect(badEmail).toEqual({
      ok: false,
      error: 'Enter a valid facility email address.',
    });

    const badPass = await signInWorkspace('nurse@phc.org', '123');
    expect(badPass).toEqual({
      ok: false,
      error: 'Password must be at least 6 characters.',
    });
  });

  it('persists and clears a valid workspace session', async () => {
    const { doc } = mockBrowserStorage();
    const res = await signInWorkspace('demo@supplai.org', 'demo-access');
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.session.email).toBe('demo@supplai.org');
      expect(res.session.facilityName).toBe('Aiyetoro Central PHC');
    }

    expect(getWorkspaceSession()?.email).toBe('demo@supplai.org');
    expect(doc.cookie).toContain('supplai_workspace_auth=1');

    clearWorkspaceSession();
    expect(getWorkspaceSession()).toBeNull();
  });

  it('requires facility name on sign up and stores facility metadata', async () => {
    mockBrowserStorage();
    const missingFacility = await signUpWorkspace(
      'lead@ifo-phc.org',
      'pass1234',
      '   ',
    );
    expect(missingFacility).toEqual({
      ok: false,
      error: 'Enter your facility or LGA unit name.',
    });

    const okRes = await signUpWorkspace(
      'lead@ifo-phc.org',
      'pass1234',
      'Ifo Primary Health Centre',
    );
    expect(okRes.ok).toBe(true);
    if (okRes.ok) {
      expect(okRes.session.facilityName).toBe('Ifo Primary Health Centre');
    }
  });
});

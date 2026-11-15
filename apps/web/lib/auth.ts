export interface WorkspaceSession {
  email: string;
  facilityName?: string;
  provider: 'supabase' | 'workspace';
  accessToken?: string;
  createdAt: string;
}

const SESSION_STORAGE_KEY = 'supplai.workspace.session';
const SESSION_COOKIE_NAME = 'supplai_workspace_auth';

function getSupabasePublicConfig(): { url: string; key: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!url || !key) return null;
  return { url: url.replace(/\/+$/, ''), key };
}

function persistSession(session: WorkspaceSession): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    document.cookie = `${SESSION_COOKIE_NAME}=1; path=/; SameSite=Lax`;
  } catch {
    // Ignore storage errors in restricted environments
  }
}

export function getWorkspaceSession(): WorkspaceSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<WorkspaceSession>;
    if (!parsed.email || !parsed.provider) return null;
    return {
      email: parsed.email,
      facilityName: parsed.facilityName,
      provider: parsed.provider,
      accessToken: parsed.accessToken,
      createdAt: parsed.createdAt ?? new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function clearWorkspaceSession(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    document.cookie = `${SESSION_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
  } catch {
    // Ignore storage errors
  }
}

export async function signInWorkspace(
  email: string,
  password: string,
): Promise<
  { ok: true; session: WorkspaceSession } | { ok: false; error: string }
> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { ok: false, error: 'Enter a valid facility email address.' };
  }
  if (!password || password.length < 6) {
    return { ok: false, error: 'Password must be at least 6 characters.' };
  }

  const sb = getSupabasePublicConfig();
  if (sb && cleanEmail !== 'demo@supplai.org') {
    try {
      const res = await fetch(`${sb.url}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: sb.key,
        },
        body: JSON.stringify({ email: cleanEmail, password }),
      });
      const payload = (await res.json()) as {
        access_token?: string;
        error_description?: string;
        msg?: string;
        user?: { user_metadata?: { facility_name?: string } };
      };
      if (!res.ok || !payload.access_token) {
        return {
          ok: false,
          error:
            payload.error_description ||
            payload.msg ||
            'Invalid email or password.',
        };
      }
      const session: WorkspaceSession = {
        email: cleanEmail,
        facilityName: payload.user?.user_metadata?.facility_name,
        provider: 'supabase',
        accessToken: payload.access_token,
        createdAt: new Date().toISOString(),
      };
      persistSession(session);
      return { ok: true, session };
    } catch {
      return {
        ok: false,
        error: 'Unable to reach Supabase authentication service.',
      };
    }
  }

  const session: WorkspaceSession = {
    email: cleanEmail,
    facilityName:
      cleanEmail === 'demo@supplai.org' ? 'Aiyetoro Central PHC' : undefined,
    provider: 'workspace',
    createdAt: new Date().toISOString(),
  };
  persistSession(session);
  return { ok: true, session };
}

export async function signUpWorkspace(
  email: string,
  password: string,
  facilityName: string,
): Promise<
  { ok: true; session: WorkspaceSession } | { ok: false; error: string }
> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanFacility = facilityName.trim();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { ok: false, error: 'Enter a valid facility email address.' };
  }
  if (!password || password.length < 6) {
    return { ok: false, error: 'Password must be at least 6 characters.' };
  }
  if (!cleanFacility) {
    return { ok: false, error: 'Enter your facility or LGA unit name.' };
  }

  const sb = getSupabasePublicConfig();
  if (sb) {
    try {
      const res = await fetch(`${sb.url}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: sb.key,
        },
        body: JSON.stringify({
          email: cleanEmail,
          password,
          data: { facility_name: cleanFacility },
        }),
      });
      const payload = (await res.json()) as {
        access_token?: string;
        error_description?: string;
        msg?: string;
      };
      if (!res.ok) {
        return {
          ok: false,
          error:
            payload.error_description ||
            payload.msg ||
            'Could not create workspace account.',
        };
      }
      const session: WorkspaceSession = {
        email: cleanEmail,
        facilityName: cleanFacility,
        provider: 'supabase',
        accessToken: payload.access_token,
        createdAt: new Date().toISOString(),
      };
      persistSession(session);
      return { ok: true, session };
    } catch {
      return {
        ok: false,
        error: 'Unable to reach Supabase authentication service.',
      };
    }
  }

  const session: WorkspaceSession = {
    email: cleanEmail,
    facilityName: cleanFacility,
    provider: 'workspace',
    createdAt: new Date().toISOString(),
  };
  persistSession(session);
  return { ok: true, session };
}

'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState, type FormEvent } from 'react';
import SiteShell from '../../components/landing/SiteShell';
import { signInWorkspace, signUpWorkspace } from '../../lib/auth';
import styles from './login.module.css';

function LoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams?.get('next') || '/dashboard';

  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [facilityName, setFacilityName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    const res =
      authMode === 'signup'
        ? await signUpWorkspace(email, password, facilityName)
        : await signInWorkspace(email, password);

    setSubmitting(false);

    if (!res.ok) {
      setError(res.error);
      return;
    }

    router.push(nextPath.startsWith('/') ? nextPath : '/dashboard');
  }

  async function enterDemoWorkspace() {
    setError('');
    setSubmitting(true);
    const res = await signInWorkspace('demo@supplai.org', 'demo-access');
    setSubmitting(false);
    if (res.ok) {
      router.push(nextPath.startsWith('/') ? nextPath : '/dashboard');
    } else {
      setError(res.error);
    }
  }

  return (
    <SiteShell>
      <section className={styles.wrap}>
        <div className={styles.story}>
          <div>
            <h1>
              Welcome back
              <br />
              to <em>Supplai.</em>
            </h1>
            <p>
              Coordinate stock, follow deliveries, and keep every handover
              accountable.
            </p>
          </div>
          <ul className={styles.roles}>
            <li>Receiving clinic</li>
            <li>Source custodian</li>
            <li>Motorcycle courier</li>
            <li>LGA supervisor</li>
          </ul>
        </div>

        <div className={styles.formSide}>
          <div className={styles.card}>
            <div className={styles.modeTabs} role="tablist">
              <button
                aria-selected={authMode === 'signin'}
                className={`${styles.modeTab} ${authMode === 'signin' ? styles.modeTabActive : ''}`}
                onClick={() => {
                  setAuthMode('signin');
                  setError('');
                }}
                role="tab"
                type="button"
              >
                Sign in
              </button>
              <button
                aria-selected={authMode === 'signup'}
                className={`${styles.modeTab} ${authMode === 'signup' ? styles.modeTabActive : ''}`}
                onClick={() => {
                  setAuthMode('signup');
                  setError('');
                }}
                role="tab"
                type="button"
              >
                Create account
              </button>
            </div>

            <h2>
              {authMode === 'signin'
                ? 'Log in to workspace'
                : 'Register facility account'}
            </h2>
            <p className={styles.sub}>
              Sign in with your facility credentials to access the Operations
              Console and LGA Oversight Desk, or enter the demo workspace.
            </p>

            <button
              className={styles.demoFill}
              disabled={submitting}
              onClick={() => void enterDemoWorkspace()}
              type="button"
            >
              <span>
                Enter demo workspace
                <small>demo@supplai.org · Aiyetoro Central PHC</small>
              </span>
              <span aria-hidden="true">→</span>
            </button>

            <form
              className={styles.form}
              onSubmit={(event) => void handleSubmit(event)}
            >
              {authMode === 'signup' && (
                <div className={styles.field}>
                  <label htmlFor="login-facility">Facility / LGA unit</label>
                  <input
                    id="login-facility"
                    name="facility"
                    onChange={(event) => {
                      setFacilityName(event.target.value);
                      setError('');
                    }}
                    placeholder="e.g. Ifo Primary Health Centre"
                    required
                    type="text"
                    value={facilityName}
                  />
                </div>
              )}

              <div className={styles.field}>
                <label htmlFor="login-email">Email address</label>
                <input
                  autoComplete="email"
                  id="login-email"
                  name="email"
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError('');
                  }}
                  placeholder="you@facility.org"
                  required
                  type="email"
                  value={email}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="login-password">Password</label>
                <input
                  autoComplete={
                    authMode === 'signup' ? 'new-password' : 'current-password'
                  }
                  id="login-password"
                  minLength={6}
                  name="password"
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError('');
                  }}
                  placeholder="At least 6 characters"
                  required
                  type="password"
                  value={password}
                />
              </div>

              {error && (
                <p className={styles.error} role="alert">
                  {error}
                </p>
              )}

              <button
                className={styles.submit}
                disabled={submitting}
                type="submit"
              >
                {submitting
                  ? 'Authenticating…'
                  : authMode === 'signup'
                    ? 'Create account & enter'
                    : 'Sign in & enter'}{' '}
                <span aria-hidden="true">→</span>
              </button>
            </form>

            <p className={styles.alt}>
              New to Supplai? <Link href="/">Explore how it works</Link>
            </p>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

export default function LoginForm() {
  return (
    <Suspense fallback={null}>
      <LoginFormInner />
    </Suspense>
  );
}

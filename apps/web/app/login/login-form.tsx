'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import SiteShell from '../../components/landing/SiteShell';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim() || !password) {
      setError('Enter an email and password to continue.');
      return;
    }

    router.push('/dashboard');
  }

  return (
    <SiteShell>
      <div className="login-page" style={{ paddingTop: 12 }}>
        <section className="login-layout">
          <div className="login-message">
            <div className="eyebrow">
              <span className="eyebrow-dot" /> Your supply network, at a glance
            </div>
            <h1>
              Welcome back
              <br />
              to <span>Supplai.</span>
            </h1>
            <p>
              Coordinate stock, follow deliveries, and keep every handover
              clear.
            </p>
            <div className="login-message-note">
              <span aria-hidden="true">✳</span>
              <span>
                <strong>One shared picture.</strong>
                <br />
                For the teams moving essential supplies.
              </span>
            </div>
          </div>

          <div className="login-card">
            <div className="login-card-heading">
              <span className="login-card-icon" aria-hidden="true">
                ↗
              </span>
              <span className="eyebrow">SUPPLAI WORKSPACE</span>
            </div>
            <h2>Log in to your account</h2>
            <p className="login-card-description">
              Use any email and password to explore this demo.
            </p>

            <form className="login-form" onSubmit={handleSubmit}>
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
              <div className="password-label-row">
                <label htmlFor="login-password">Password</label>
                <span>Demo access</span>
              </div>
              <input
                autoComplete="current-password"
                id="login-password"
                name="password"
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError('');
                }}
                placeholder="Enter any password"
                required
                type="password"
                value={password}
              />
              {error && (
                <p className="login-error" role="alert">
                  {error}
                </p>
              )}
              <button
                className="button button-primary login-submit"
                type="submit"
              >
                Continue to dashboard <span aria-hidden="true">→</span>
              </button>
            </form>

            <p className="demo-notice">
              This is a demo sign-in only. No credentials are stored or checked.
            </p>
            <div className="login-card-footer">
              <span>New to Supplai?</span>
              <Link href="/">Explore how it works</Link>
            </div>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}

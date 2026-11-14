'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import SiteShell from '../../components/landing/SiteShell';
import styles from './login.module.css';

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

  function fillDemo() {
    setEmail('demo@supplai.org');
    setPassword('demo-access');
    setError('');
  }

  return (
    <SiteShell>
      <section className={styles.wrap}>
        <div className={styles.story}>
          <div>
            <span className={styles.eyebrow}>
              <i /> Your supply network, at a glance
            </span>
            <h1>
              Welcome back
              <br />
              to <em>Supplai.</em>
            </h1>
            <p>
              Coordinate stock, follow deliveries, and keep every handover
              clear.
            </p>
          </div>
          <ul className={styles.roles}>
            <li>
              <b>01</b> Receiving clinic
            </li>
            <li>
              <b>02</b> Source custodian
            </li>
            <li>
              <b>03</b> Motorcycle courier
            </li>
            <li>
              <b>04</b> LGA supervisor
            </li>
          </ul>
        </div>

        <div className={styles.formSide}>
          <div className={styles.card}>
            <p className={styles.cardEyebrow}>Supplai workspace</p>
            <h2>Log in to your account</h2>
            <p className={styles.sub}>
              Use any email and password to explore this demo, or fill in a demo
              account in one tap.
            </p>

            <button
              className={styles.demoFill}
              onClick={fillDemo}
              type="button"
            >
              <span>
                Use the demo account
                <small>demo@supplai.org</small>
              </span>
              <span aria-hidden="true">↳</span>
            </button>

            <form className={styles.form} onSubmit={handleSubmit}>
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
              </div>
              {error && (
                <p className={styles.error} role="alert">
                  {error}
                </p>
              )}
              <button className={styles.submit} type="submit">
                Continue to dashboard <span aria-hidden="true">→</span>
              </button>
            </form>

            <p className={styles.notice}>
              Demo sign-in only. No credentials are stored or checked.
            </p>
            <p className={styles.alt}>
              New to Supplai? <Link href="/">Explore how it works</Link>
            </p>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import AuthGuard from '../../components/AuthGuard';
import BrandLogo from '../../components/BrandLogo';
import type { AppMode } from '../../components/RolePicker';
import { clearWorkspaceSession, getWorkspaceSession } from '../../lib/auth';
import MobileClient from '../mobile-client';
import styles from './dashboard.module.css';

const WORKSPACE_ITEMS: { key: AppMode; label: string; hint: string }[] = [
  { key: 'home', label: 'Workspace Home', hint: 'Role overview' },
  { key: 'request', label: 'Request Stock', hint: 'ORS & Zinc' },
  { key: 'release', label: 'Release Surplus', hint: 'Safety floor & FEFO' },
  { key: 'rider', label: 'Live Dispatch', hint: 'Courier route & seal' },
  { key: 'handover', label: 'Confirm Handover', hint: 'PIN 5082 verification' },
  { key: 'activity', label: 'Activity & Ledger', hint: 'Transfers & LGA card' },
  { key: 'account', label: 'Account & Settings', hint: 'Profile & controls' },
];

export default function DashboardShell() {
  const router = useRouter();
  const [mode, setMode] = useState<AppMode>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const session = getWorkspaceSession();

  function handleSignOut() {
    clearWorkspaceSession();
    router.replace('/login');
  }

  return (
    <AuthGuard>
      <div className={styles.shell}>
        <aside
          aria-label="Workspace navigation"
          className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}
        >
          <div className={styles.sidebarTop}>
            <Link className={styles.brand} href="/">
              <BrandLogo size={26} />
              <span>Supplai</span>
            </Link>
            <button
              aria-label="Close sidebar"
              className={styles.closeBtn}
              onClick={() => setSidebarOpen(false)}
              type="button"
            >
              ✕
            </button>
          </div>

          <nav className={styles.sideNav}>
            <p className={styles.sideHeading}>Operations</p>
            {WORKSPACE_ITEMS.map((item) => {
              const active = mode === item.key;
              return (
                <button
                  key={item.key}
                  aria-current={active ? 'page' : undefined}
                  className={`${styles.sideItem} ${active ? styles.sideItemActive : ''}`}
                  onClick={() => {
                    setMode(item.key);
                    setSidebarOpen(false);
                  }}
                  type="button"
                >
                  <strong>{item.label}</strong>
                  <span>{item.hint}</span>
                </button>
              );
            })}

            <p className={styles.sideHeading} style={{ marginTop: 18 }}>
              Oversight
            </p>
            <Link className={styles.sideLink} href="/lga">
              <div>
                <strong>LGA Decision Desk</strong>
                <span>Priority queue &amp; exceptions</span>
              </div>
              <span aria-hidden="true">↗</span>
            </Link>
          </nav>

          <div className={styles.sidebarFooter}>
            {session && (
              <div className={styles.userBox}>
                <strong>{session.facilityName ?? 'Facility Operator'}</strong>
                <span>{session.email}</span>
              </div>
            )}
            <button
              className={styles.signOutBtn}
              onClick={handleSignOut}
              type="button"
            >
              Sign out
            </button>
          </div>
        </aside>

        {sidebarOpen && (
          <button
            aria-label="Close navigation overlay"
            className={styles.backdrop}
            onClick={() => setSidebarOpen(false)}
            type="button"
          />
        )}

        <div className={styles.main}>
          <div className={styles.floatingBar}>
            <button
              aria-label="Open navigation"
              className={`${styles.floatBtn} ${styles.menuBtn}`}
              onClick={() => setSidebarOpen(true)}
              type="button"
            >
              ☰ Menu
            </button>

            <div className={styles.floatGroup}>
              <button
                className={styles.floatBtn}
                onClick={() => {
                  setMode('home');
                  setResetKey((k) => k + 1);
                }}
                type="button"
              >
                Reset
              </button>
              <Link className={styles.floatBtn} href="/lga">
                LGA Desk ↗
              </Link>
              <Link className={styles.floatBtn} href="/">
                Home ↗
              </Link>
            </div>
          </div>

          <section aria-label="Supplai operations workspace" className={styles.workspace}>
            <MobileClient
              key={resetKey}
              controlledMode={mode}
              hideDock
              onModeChange={setMode}
            />
          </section>
        </div>
      </div>
    </AuthGuard>
  );
}

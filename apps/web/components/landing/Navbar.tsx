'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { landingContent } from './content';
import styles from './landing.module.css';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen]);

  return (
    <>
      <header className={styles.navbar}>
        <Link className={styles.brand} href="/" aria-label="Supplai home">
          <span className={styles.brandMark} aria-hidden="true">
            +
          </span>
          <span>supplai</span>
        </Link>

        <nav
          aria-label="Main navigation"
          className={`${styles.navigation} ${menuOpen ? styles.navigationOpen : ''}`}
          id="landing-navigation"
        >
          {landingContent.navigation.map((item) => (
            <a
              href={item.href}
              key={item.href}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <Link
            className={styles.dashboardLink}
            href="/dashboard"
            onClick={() => setMenuOpen(false)}
          >
            Dashboard <span aria-hidden="true">↗</span>
          </Link>
        </nav>

        <button
          aria-controls="landing-navigation"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
          className={`${styles.navToggle} ${menuOpen ? styles.navToggleOpen : ''}`}
          onClick={() => setMenuOpen((open) => !open)}
          type="button"
        >
          <span />
          <span />
        </button>
      </header>

      {menuOpen && (
        <button
          aria-label="Close navigation"
          className={styles.navBackdrop}
          onClick={() => setMenuOpen(false)}
          type="button"
        />
      )}
    </>
  );
}

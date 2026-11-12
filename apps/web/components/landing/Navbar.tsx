'use client';

import Link from 'next/link';
import { useState } from 'react';
import { landingContent } from './content';
import styles from './landing.module.css';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
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
      </nav>

      <Link className={styles.loginLink} href="/dashboard">
        Dashboard <span aria-hidden="true">↗</span>
      </Link>

      <button
        aria-controls="landing-navigation"
        aria-expanded={menuOpen}
        aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
        className={styles.navToggle}
        onClick={() => setMenuOpen((open) => !open)}
        type="button"
      >
        <span />
        <span />
      </button>
    </header>
  );
}

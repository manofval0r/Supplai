'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './landing.module.css';

type NavKey =
  'overview' | 'network' | 'how-it-works' | 'app-preview' | 'lga' | 'login';

interface NavItem {
  key: NavKey;
  label: string;
  href: string;
  hasMegaMenu?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { key: 'overview', label: 'Overview', href: '/', hasMegaMenu: true },
  { key: 'network', label: 'Network', href: '/#our-network' },
  { key: 'how-it-works', label: 'How it works', href: '/#how-it-works' },
  { key: 'app-preview', label: 'App Preview', href: '/app-preview' },
  { key: 'lga', label: 'LGA Desk', href: '/lga' },
  { key: 'login', label: 'Sign in', href: '/login' },
];

const MEGA_COLUMNS = [
  {
    heading: 'On Landing',
    links: [
      {
        title: 'Clinic Skyline & Mission',
        desc: 'Coordinate ambient-only medicine transfers across PHCs.',
        href: '/',
        tag: '01',
      },
      {
        title: 'Our Network & Guardrails',
        desc: 'Two-sided custody, safety floors, and zero cold-chain drift.',
        href: '/#our-network',
        tag: '02',
      },
      {
        title: 'Facility App Showcase',
        desc: 'Interactive 3D Expo phone mockup and screen walkthroughs.',
        href: '/#app-preview',
        tag: '03',
      },
      {
        title: 'Three-Step Flow',
        desc: 'From facility request and FEFO release to PIN-verified receipt.',
        href: '/#how-it-works',
        tag: '04',
      },
    ],
  },
  {
    heading: 'Live Surfaces',
    links: [
      {
        title: 'Interactive Web Console',
        desc: 'Run facility requests, releases, rider tracking, and Scenario Lab.',
        href: '/dashboard',
        tag: 'LIVE',
      },
      {
        title: 'LGA Oversight Desk',
        desc: 'Priority transfer queue, attention reasons, and escalations.',
        href: '/lga',
        tag: 'OPS',
      },
      {
        title: 'Mobile App Preview & APK',
        desc: 'EAS Android build download, high-res screens, and Drive clips.',
        href: '/app-preview',
        tag: 'APK',
      },
      {
        title: 'Workspace Sign In',
        desc: 'Demo sign-in gate with instant access into facility workflows.',
        href: '/login',
        tag: 'DEMO',
      },
    ],
  },
];

function resolveRouteKey(pathname: string, sectionKey: NavKey): NavKey | null {
  if (pathname.startsWith('/lga')) return 'lga';
  if (pathname.startsWith('/app-preview')) return 'app-preview';
  if (pathname.startsWith('/login')) return 'login';
  if (pathname.startsWith('/dashboard')) return null;
  return sectionKey;
}

export default function Navbar() {
  const pathname = usePathname() || '/';
  const [menuOpen, setMenuOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [sectionKey, setSectionKey] = useState<NavKey>('overview');
  const [hoveredKey, setHoveredKey] = useState<NavKey | null>(null);
  const [pillRect, setPillRect] = useState<{
    left: number;
    width: number;
    visible: boolean;
  }>({ left: 0, width: 0, visible: false });

  const navRef = useRef<HTMLElement | null>(null);
  const itemRefs = useRef<Partial<Record<NavKey, HTMLAnchorElement | null>>>(
    {},
  );
  const megaTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeKey = resolveRouteKey(pathname, sectionKey);
  const targetKey = hoveredKey ?? activeKey;

  const measurePill = useCallback((key: NavKey | null) => {
    const navEl = navRef.current;
    const targetEl = key ? itemRefs.current[key] : null;
    if (!navEl || !targetEl || navEl.offsetWidth === 0) {
      setPillRect((prev) =>
        prev.visible ? { ...prev, visible: false } : prev,
      );
      return;
    }

    const navBox = navEl.getBoundingClientRect();
    const itemBox = targetEl.getBoundingClientRect();
    const nextLeft = Math.round(itemBox.left - navBox.left);
    const nextWidth = Math.round(itemBox.width);

    setPillRect({ left: nextLeft, width: nextWidth, visible: nextWidth > 0 });
  }, []);

  // Measure sliding pill whenever route, active section, or hover target changes
  useEffect(() => {
    measurePill(targetKey);
  }, [targetKey, measurePill]);

  // Keep pill aligned across viewport resizes
  useEffect(() => {
    const onResize = () => measurePill(targetKey);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [targetKey, measurePill]);

  // Dynamically track landing page sections while scrolling on '/'
  useEffect(() => {
    if (pathname !== '/') {
      setSectionKey('overview');
      return;
    }

    const tracked: { id: string; key: NavKey }[] = [
      { id: 'our-network', key: 'network' },
      { id: 'how-it-works', key: 'how-it-works' },
      { id: 'app-preview', key: 'app-preview' },
    ];

    const handleScroll = () => {
      const y = window.scrollY;
      if (y < 240) {
        setSectionKey('overview');
        return;
      }

      const probe = y + window.innerHeight * 0.38;
      let matched: NavKey = 'overview';
      for (const entry of tracked) {
        const el = document.getElementById(entry.id);
        if (!el) continue;
        const top = el.offsetTop;
        if (probe >= top) {
          matched = entry.key;
        }
      }
      setSectionKey(matched);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  useEffect(() => {
    setMenuOpen(false);
    setMegaOpen(false);
    setHoveredKey(null);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen && !megaOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        setMegaOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen, megaOpen]);

  const scheduleMegaClose = () => {
    if (megaTimerRef.current) clearTimeout(megaTimerRef.current);
    megaTimerRef.current = setTimeout(() => setMegaOpen(false), 140);
  };

  const cancelMegaClose = () => {
    if (megaTimerRef.current) clearTimeout(megaTimerRef.current);
  };

  const isDashboard = pathname.startsWith('/dashboard');

  return (
    <>
      <div
        className={styles.navbarFrame}
        onMouseLeave={() => {
          setHoveredKey(null);
          scheduleMegaClose();
        }}
      >
        <header className={styles.navbar}>
          <Link className={styles.brand} href="/" aria-label="Supplai home">
            <span className={styles.brandMark} aria-hidden="true">
              +
            </span>
            <span>supplai</span>
          </Link>

          <nav
            ref={navRef}
            aria-label="Main navigation"
            className={`${styles.navigation} ${menuOpen ? styles.navigationOpen : ''}`}
            id="landing-navigation"
            onMouseLeave={() => setHoveredKey(null)}
          >
            <span
              aria-hidden="true"
              className={`${styles.navPill} ${pillRect.visible ? styles.navPillVisible : ''}`}
              style={{
                width: `${pillRect.width}px`,
                transform: `translate3d(${pillRect.left}px, -50%, 0)`,
              }}
            />

            {NAV_ITEMS.map((item) => {
              const isCurrent = targetKey === item.key;
              return (
                <Link
                  key={item.key}
                  ref={(el) => {
                    itemRefs.current[item.key] = el;
                  }}
                  href={item.href}
                  className={`${styles.navLink} ${isCurrent ? styles.navLinkCurrent : ''}`}
                  aria-current={activeKey === item.key ? 'page' : undefined}
                  aria-expanded={item.hasMegaMenu ? megaOpen : undefined}
                  onMouseEnter={() => {
                    setHoveredKey(item.key);
                    cancelMegaClose();
                    if (item.hasMegaMenu) {
                      setMegaOpen(true);
                    } else {
                      setMegaOpen(false);
                    }
                  }}
                  onFocus={() => {
                    setHoveredKey(item.key);
                    if (item.hasMegaMenu) setMegaOpen(true);
                  }}
                  onClick={() => {
                    setMenuOpen(false);
                    setMegaOpen(false);
                    if (pathname === '/' && item.href.startsWith('/#')) {
                      setSectionKey(item.key);
                    }
                  }}
                >
                  <span>{item.label}</span>
                  {item.hasMegaMenu && (
                    <span className={styles.navCaret} aria-hidden="true">
                      ▾
                    </span>
                  )}
                </Link>
              );
            })}

            <Link
              className={`${styles.dashboardLink} ${styles.mobileOnlyDashboard} ${isDashboard ? styles.dashboardLinkActive : ''}`}
              href="/dashboard"
              onClick={() => setMenuOpen(false)}
            >
              Dashboard <span aria-hidden="true">↗</span>
            </Link>
          </nav>

          <div className={styles.navRight}>
            <Link
              className={`${styles.dashboardLink} ${isDashboard ? styles.dashboardLinkActive : ''}`}
              href="/dashboard"
              aria-current={isDashboard ? 'page' : undefined}
            >
              Dashboard <span aria-hidden="true">↗</span>
            </Link>

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
          </div>
        </header>

        {megaOpen && (
          <div
            className={styles.megaMenu}
            onMouseEnter={cancelMegaClose}
            onMouseLeave={scheduleMegaClose}
            role="region"
            aria-label="Explore Supplai surfaces"
          >
            <div className={styles.megaGrid}>
              {MEGA_COLUMNS.map((col) => (
                <div className={styles.megaColumn} key={col.heading}>
                  <p className={styles.megaHeading}>{col.heading}</p>
                  <div className={styles.megaList}>
                    {col.links.map((entry) => (
                      <Link
                        key={entry.title}
                        href={entry.href}
                        className={styles.megaCard}
                        onClick={() => setMegaOpen(false)}
                      >
                        <span className={styles.megaTag}>{entry.tag}</span>
                        <div>
                          <strong>{entry.title}</strong>
                          <span>{entry.desc}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

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

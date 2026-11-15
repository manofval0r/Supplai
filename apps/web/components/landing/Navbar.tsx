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

const MEGA_LINKS = [
  {
    title: 'Operations Console',
    desc: 'Request stock, release surplus, and manage live courier dispatch.',
    href: '/dashboard',
  },
  {
    title: 'LGA Oversight Desk',
    desc: 'Priority transfer queue, attention reasons, and escalations.',
    href: '/lga',
  },
  {
    title: 'Mobile App & APK',
    desc: 'Expo Android build download, 3D phone showcase, and walkthroughs.',
    href: '/app-preview',
  },
  {
    title: 'Workspace Sign In',
    desc: 'Authenticate into facility and LGA supervisor workflows.',
    href: '/login',
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
              <div className={styles.megaColumn}>
                <p className={styles.megaHeading}>Workspace &amp; Platform</p>
                <div className={styles.megaList}>
                  {MEGA_LINKS.map((entry) => (
                    <Link
                      key={entry.title}
                      href={entry.href}
                      className={styles.megaCard}
                      onClick={() => setMegaOpen(false)}
                    >
                      <div>
                        <strong>{entry.title}</strong>
                        <span>{entry.desc}</span>
                      </div>
                      <span className={styles.megaArrow} aria-hidden="true">
                        →
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className={styles.megaIllustration} aria-hidden="true">
                <svg
                  viewBox="0 0 320 260"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={styles.megaSvg}
                >
                  <rect
                    x="10"
                    y="10"
                    width="300"
                    height="240"
                    rx="18"
                    fill="#F8FAFE"
                    stroke="#E2E8F0"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M36 196 H284 M36 156 H284 M36 116 H284"
                    stroke="#1558C9"
                    strokeOpacity="0.1"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M72 86 Q135 142 168 134 T252 84"
                    stroke="#1558C9"
                    strokeWidth="3"
                    strokeDasharray="6 6"
                    strokeLinecap="round"
                  />
                  <circle cx="72" cy="86" r="20" fill="#1558C9" />
                  <path
                    d="M72 76 V96 M62 86 H82"
                    stroke="#D4FF24"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="166"
                    cy="134"
                    r="22"
                    fill="#D4FF24"
                    stroke="#030407"
                    strokeWidth="2"
                  />
                  <path
                    d="M166 123 V145 M155 134 H177"
                    stroke="#030407"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <circle cx="252" cy="84" r="20" fill="#1558C9" />
                  <path
                    d="M252 74 V94 M242 84 H262"
                    stroke="#D4FF24"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <rect
                    x="56"
                    y="194"
                    width="208"
                    height="36"
                    rx="10"
                    fill="#FFFFFF"
                    stroke="#030407"
                    strokeWidth="1.5"
                  />
                  <text
                    x="74"
                    y="216"
                    fill="#030407"
                    fontSize="11"
                    fontWeight="700"
                  >
                    PHC-to-PHC Ambient Dispatch
                  </text>
                </svg>
              </div>
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

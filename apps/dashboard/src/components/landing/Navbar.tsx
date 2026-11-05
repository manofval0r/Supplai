'use client';

import { useEffect, useRef, useState } from 'react';
import BrandLogo from './BrandLogo';
import { CloseIcon, MenuIcon } from './icons';

const links = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Features', href: '#features' },
  { label: 'About', href: '#about' },
  { label: 'FAQ', href: '#faq' },
];

export default function Navbar({
  onOpenDashboard,
}: {
  onOpenDashboard: () => void;
}) {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      toggleRef.current?.focus();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  return (
    <header className="lp-nav">
      <div className="lp-container lp-nav__inner">
        <a className="lp-nav__brand" href="#top" aria-label="S supplai home">
          <BrandLogo />
        </a>

        <nav className="lp-nav__links" aria-label="Primary navigation">
          {links.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="lp-nav__actions">
          <button
            type="button"
            className="lp-nav__dashboard"
            onClick={onOpenDashboard}
          >
            Open dashboard
          </button>
          <button
            ref={toggleRef}
            type="button"
            className="lp-nav__toggle"
            aria-expanded={open}
            aria-controls="lp-mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((current) => !current)}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="lp-mobile-menu" id="lp-mobile-menu">
          <nav aria-label="Mobile navigation">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <button
              type="button"
              className="lp-mobile-menu__dashboard"
              onClick={() => {
                setOpen(false);
                onOpenDashboard();
              }}
            >
              Open dashboard
            </button>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

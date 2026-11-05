'use client';

import { useEffect } from 'react';

const REVEAL_SELECTOR = '[data-reveal]';
const VISIBLE_CLASS = 'is-visible';
const MOTION_CLASS = 'lp-motion-ready';
const REDUCED_CLASS = 'lp-reveal-off';

/**
 * Lightweight scroll reveal. The hidden state is only applied after this hook
 * runs, so the page remains readable when JavaScript is unavailable.
 */
export default function useReveal(rootSelector = '.lp-root') {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(rootSelector);
    if (!root) return;

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    if (reduceMotion) {
      root.classList.add(REDUCED_CLASS);
      return;
    }

    root.classList.add(MOTION_CLASS);
    const nodes = root.querySelectorAll<HTMLElement>(REVEAL_SELECTOR);

    if (!('IntersectionObserver' in window)) {
      nodes.forEach((node) => node.classList.add(VISIBLE_CLASS));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add(VISIBLE_CLASS);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -48px' },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [rootSelector]);
}

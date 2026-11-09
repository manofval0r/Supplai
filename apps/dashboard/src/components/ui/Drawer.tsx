'use client';

import { useEffect, type ReactNode } from 'react';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { IconChip } from './IconChip';
import { IconButton } from './IconButton';

export function Drawer({
  onClose,
  ariaLabel,
  title,
  subtitle,
  icon,
  headerActions,
  className = '',
  children,
}: {
  onClose: () => void;
  ariaLabel: string;
  title: string;
  subtitle?: ReactNode;
  icon?: IconDefinition;
  headerActions?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="ui-overlay" onClick={onClose}>
      <aside
        className={`ui-drawer ${className}`}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
      >
        <header className="ui-drawer__header">
          <div className="ui-drawer__title">
            {icon && <IconChip icon={icon} tone="tint" size="md" />}
            <div>
              <h3>{title}</h3>
              {subtitle && <p className="ui-drawer__subtitle">{subtitle}</p>}
            </div>
          </div>
          <div className="ui-drawer__actions">
            {headerActions}
            <IconButton icon={faXmark} label="Close panel" onClick={onClose} />
          </div>
        </header>
        <div className="ui-drawer__body">{children}</div>
      </aside>
    </div>
  );
}
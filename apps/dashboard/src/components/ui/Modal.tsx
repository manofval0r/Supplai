'use client';

import { useEffect, type ReactNode } from 'react';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { IconChip } from './IconChip';
import { IconButton } from './IconButton';

export function Modal({
  onClose,
  labelledBy,
  title,
  subtitle,
  icon,
  headerActions,
  className = '',
  children,
}: {
  onClose: () => void;
  labelledBy?: string;
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
    <div className="ui-overlay ui-overlay--center" onClick={onClose}>
      <div
        className={`ui-modal ${className}`}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
      >
        <header className="ui-modal__header">
          <div className="ui-modal__title">
            {icon && <IconChip icon={icon} tone="tint" size="md" />}
            <div>
              <h3 id={labelledBy}>{title}</h3>
              {subtitle && <p className="ui-modal__subtitle">{subtitle}</p>}
            </div>
          </div>
          <div className="ui-modal__actions">
            {headerActions}
            <IconButton icon={faXmark} label="Close dialog" onClick={onClose} />
          </div>
        </header>
        <div className="ui-modal__body">{children}</div>
      </div>
    </div>
  );
}
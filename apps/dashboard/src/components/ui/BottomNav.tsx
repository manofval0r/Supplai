'use client';

import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export interface DockItem {
  label: string;
  icon: IconDefinition;
  badge?: number | undefined;
}

export function BottomNav({
  items,
  active,
  onSelect,
}: {
  items: DockItem[];
  active: string;
  onSelect: (label: string) => void;
}) {
  return (
    <nav className="ui-dock" aria-label="Primary mobile navigation">
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          className={`ui-dock__item ${active === item.label ? 'is-active' : ''}`}
          aria-current={active === item.label ? 'page' : undefined}
          onClick={() => onSelect(item.label)}
        >
          <span className="ui-dock__icon">
            <FontAwesomeIcon icon={item.icon} aria-hidden="true" />
            {typeof item.badge === 'number' && item.badge > 0 && (
              <b className="ui-dock__badge">{item.badge}</b>
            )}
          </span>
          <span className="ui-dock__label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

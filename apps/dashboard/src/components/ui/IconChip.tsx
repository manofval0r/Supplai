'use client';

import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export type ChipTone =
  | 'tint'
  | 'lime'
  | 'success'
  | 'warning'
  | 'danger'
  | 'neutral'
  | 'cobalt';
export type ChipSize = 'sm' | 'md' | 'lg';

export function IconChip({
  icon,
  tone = 'tint',
  size = 'md',
  className = '',
}: {
  icon: IconDefinition;
  tone?: ChipTone;
  size?: ChipSize;
  className?: string;
}) {
  return (
    <span
      className={`ui-chip ui-chip--${tone} ui-chip--${size} ${className}`}
      aria-hidden="true"
    >
      <FontAwesomeIcon icon={icon} />
    </span>
  );
}
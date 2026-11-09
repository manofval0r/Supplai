'use client';

import type { ButtonHTMLAttributes } from 'react';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export interface IconButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconDefinition;
  label: string;
  tone?: 'neutral' | 'tint' | 'cobalt';
  size?: 'sm' | 'md';
}

export function IconButton({
  icon,
  label,
  tone = 'neutral',
  size = 'md',
  className = '',
  type = 'button',
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      className={`ui-icon-btn ui-icon-btn--${tone} ui-icon-btn--${size} ${className}`}
      aria-label={label}
      title={label}
      {...rest}
    >
      <FontAwesomeIcon icon={icon} aria-hidden="true" />
    </button>
  );
}
'use client';

import type { ButtonHTMLAttributes } from 'react';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'danger'
  | 'lime';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconDefinition;
  block?: boolean;
  iconOnly?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  block = false,
  iconOnly = false,
  className = '',
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  const classes = [
    'ui-btn',
    `ui-btn--${variant}`,
    `ui-btn--${size}`,
    block ? 'ui-btn--block' : '',
    iconOnly ? 'ui-btn--icon-only' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} className={classes} {...rest}>
      {icon && <FontAwesomeIcon icon={icon} aria-hidden="true" />}
      {children}
    </button>
  );
}
'use client';

import type { HTMLAttributes, ElementType } from 'react';

export type CardTone = 'tile' | 'surface' | 'hero' | 'outline';
export type CardPad = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  tone?: CardTone;
  pad?: CardPad;
  interactive?: boolean;
}

export function Card({
  as: Tag = 'div',
  tone = 'surface',
  pad = 'md',
  interactive = false,
  className = '',
  children,
  ...rest
}: CardProps) {
  const classes = [
    'ui-card',
    `ui-card--${tone}`,
    `ui-card--pad-${pad}`,
    interactive ? 'ui-card--interactive' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag className={classes} {...rest}>
      {children}
    </Tag>
  );
}
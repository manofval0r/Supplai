'use client';

import type { HTMLAttributes } from 'react';

export type BadgeTone =
  | 'neutral'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger'
  | 'lime';

const SUCCESS = new Set(['delivered', 'confirmed', 'matched', 'done', 'completed']);
const INFO = new Set(['dispatched', 'in_transit', 'open', 'pending', 'active']);
const DANGER = new Set([
  'failed',
  'expired',
  'locked',
  'proof_locked',
  'unmatched',
  'stockout',
  'critical',
]);
const WARNING = new Set(['dispatch', 'warning', 'low']);

export function statusTone(status: string): BadgeTone {
  if (SUCCESS.has(status)) return 'success';
  if (INFO.has(status)) return 'info';
  if (DANGER.has(status)) return 'danger';
  if (WARNING.has(status)) return 'warning';
  return 'neutral';
}

export function statusLabel(status: string): string {
  return status.replace(/_/g, ' ');
}

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  status?: string;
  dot?: boolean;
}

export function Badge({
  tone,
  status,
  dot = false,
  className = '',
  children,
  ...rest
}: BadgeProps) {
  const resolved = tone ?? (status ? statusTone(status) : 'neutral');
  const classes = ['ui-badge', `ui-badge--${resolved}`, className]
    .filter(Boolean)
    .join(' ');
  return (
    <span className={classes} {...rest}>
      {dot && <i className="ui-badge__dot" aria-hidden="true" />}
      {children ?? (status ? statusLabel(status) : null)}
    </span>
  );
}
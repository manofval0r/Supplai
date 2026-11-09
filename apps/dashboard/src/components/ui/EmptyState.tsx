'use client';

import type { ReactNode } from 'react';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faBoxOpen } from '@fortawesome/free-solid-svg-icons';
import { IconChip } from './IconChip';

export function EmptyState({
  icon = faBoxOpen,
  title,
  text,
  action,
}: {
  icon?: IconDefinition;
  title: string;
  text?: string;
  action?: ReactNode;
}) {
  return (
    <div className="ui-empty" role="status">
      <IconChip icon={icon} tone="neutral" size="lg" />
      <strong className="ui-empty__title">{title}</strong>
      {text && <p className="ui-empty__text">{text}</p>}
      {action && <div className="ui-empty__action">{action}</div>}
    </div>
  );
}
'use client';

import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { Card } from './Card';
import { IconChip, type ChipTone } from './IconChip';

export type StatTone = 'alert' | 'route' | 'done' | 'warning' | 'rate' | 'neutral';

const CHIP_TONE: Record<StatTone, ChipTone> = {
  alert: 'danger',
  route: 'tint',
  done: 'success',
  warning: 'warning',
  rate: 'lime',
  neutral: 'tint',
};

export function StatTile({
  label,
  value,
  caption,
  icon,
  tone = 'neutral',
}: {
  label: string;
  value: string;
  caption: string;
  icon: IconDefinition;
  tone?: StatTone;
}) {
  return (
    <Card as="article" tone="tile" pad="md" className={`ui-stat ui-stat--${tone}`}>
      <IconChip icon={icon} tone={CHIP_TONE[tone]} size="md" />
      <p className="ui-stat__label">{label}</p>
      <strong className="ui-stat__value" aria-live="polite">
        {value}
      </strong>
      <small className="ui-stat__caption">{caption}</small>
    </Card>
  );
}
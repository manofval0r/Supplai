'use client';

import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faPrescriptionBottleMedical } from '@fortawesome/free-solid-svg-icons';
import { Card } from './Card';
import { Badge, type BadgeTone } from './Badge';
import { Button } from './Button';
import { IconChip } from './IconChip';

export interface MedicineCardProps {
  name: string;
  strength: string;
  icon?: IconDefinition;
  onHand: number;
  unit: string;
  availability: { tone: BadgeTone; label: string };
  transferable?: number;
  etaLabel?: string;
  requestLabel?: string;
  onRequest?: () => void;
  disabled?: boolean;
}

export function MedicineCard({
  name,
  strength,
  icon = faPrescriptionBottleMedical,
  onHand,
  unit,
  availability,
  transferable,
  etaLabel,
  requestLabel = 'Request stock',
  onRequest,
  disabled = false,
}: MedicineCardProps) {
  return (
    <Card tone="tile" pad="md" className="ui-med">
      <div className="ui-med__head">
        <IconChip icon={icon} tone="tint" size="lg" className="ui-med__art" />
        <div className="ui-med__title">
          <strong className="ui-med__name">{name}</strong>
          <span className="ui-med__strength">{strength}</span>
        </div>
        <Badge tone={availability.tone}>{availability.label}</Badge>
      </div>

      <div className="ui-med__meta">
        <span className="ui-med__qty">
          <strong>{onHand}</strong> {unit} on hand
        </span>
        {typeof transferable === 'number' && (
          <span className="ui-med__surplus">{transferable} transferable</span>
        )}
        {etaLabel && <span className="ui-med__eta">{etaLabel}</span>}
      </div>

      {onRequest && (
        <Button
          variant="primary"
          size="md"
          block
          className="ui-med__cta"
          onClick={onRequest}
          disabled={disabled}
        >
          {requestLabel}
        </Button>
      )}
    </Card>
  );
}
'use client';

import { useState } from 'react';
import { faMinus, faPlus, faLocationDot } from '@fortawesome/free-solid-svg-icons';
import {
  fixtureFacilities,
  fixtureMedicines,
  getStockPosition,
} from '../data/fixtures';
import { Modal, SegmentedControl, Button, IconButton, IconChip } from './ui';

const SEGMENT_LABEL: Record<string, string> = {
  'MED-ORS': 'ORS, 20.5 g',
  'MED-ZINC': 'Zinc, 20 mg',
};

const DONOR_ID = 'PHC-B';

export function RequestStockModal({
  medicineId,
  onClose,
  onConfirm,
}: {
  medicineId: string | null;
  onClose: () => void;
  onConfirm: (facilityName: string, drug: string, qty: number) => void;
}) {
  const [selectedId, setSelectedId] = useState(medicineId ?? 'MED-ORS');
  const [qty, setQty] = useState(20);

  if (!medicineId) return null;

  const medicine =
    fixtureMedicines.find((item) => item.id === selectedId) ??
    fixtureMedicines[0]!;
  const position = getStockPosition(DONOR_ID, medicine.id);
  const onHand = position?.onHand ?? 0;
  const minimum = position?.minimum ?? 0;
  const transferable = Math.max(0, onHand - minimum);
  const clampedQty = Math.min(Math.max(1, qty), Math.max(1, transferable));
  const progress =
    transferable > 0 ? Math.min(100, (clampedQty / transferable) * 100) : 0;
  const donor = fixtureFacilities.find((item) => item.id === DONOR_ID);

  const changeMedicine = (value: string) => {
    setSelectedId(value);
    setQty(20);
  };

  return (
    <Modal
      onClose={onClose}
      labelledBy="request-stock-title"
      title="Request stock"
      subtitle="Pull surplus from a nearby clinic above its safety floor"
      className="request-modal"
    >
      <SegmentedControl
        options={fixtureMedicines.map((item) => ({
          value: item.id,
          label: SEGMENT_LABEL[item.id] ?? item.name,
        }))}
        value={selectedId}
        onChange={changeMedicine}
        ariaLabel="Choose medicine"
      />

      <div className="request-qty-card">
        <div className="request-qty-row">
          <span className="request-qty-value">
            <strong>{clampedQty}</strong>
            <span>{medicine.unit}</span>
          </span>
          <span className="request-qty-stepper">
            <IconButton
              icon={faMinus}
              label="Decrease quantity"
              tone="neutral"
              onClick={() => setQty((current) => Math.max(1, current - 5))}
            />
            <IconButton
              icon={faPlus}
              label="Increase quantity"
              tone="cobalt"
              onClick={() =>
                setQty((current) => Math.min(transferable, current + 5))
              }
            />
          </span>
        </div>
        <div className="request-progress-track">
          <span
            className="request-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="request-qty-meta">
          <span>
            {donor?.name} has <strong>{onHand}</strong>
          </span>
          <span>
            <strong>{Math.max(0, onHand - clampedQty)}</strong> left after
          </span>
        </div>
        <div className="request-donor-row">
          <IconChip icon={faLocationDot} tone="lime" size="md" />
          <div className="request-donor-info">
            <strong>{donor?.name}</strong>
            <span>1.8 km away, about 7 min by rider</span>
          </div>
          <span className="request-eta-pill">7 MIN</span>
        </div>
      </div>

      <Button
        variant="primary"
        size="lg"
        block
        onClick={() => {
          onConfirm(donor?.name ?? DONOR_ID, medicine.name, clampedQty);
          onClose();
        }}
      >
        Request from {donor?.name}
      </Button>
    </Modal>
  );
}
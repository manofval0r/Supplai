'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTruckFast,
  faShieldHalved,
  faCircleCheck,
  faPhone,
  faRotateRight,
  faBoxesStacked,
  faKey,
} from '@fortawesome/free-solid-svg-icons';
import { transferStatusLabel } from '../lib/statusLabels';
import type { TransferSummary } from '@supplai/contracts';
import { Modal, OrderTimeline, Button, Badge } from './ui';

export interface TransferDetailData {
  id: string;
  reference: string;
  status: TransferSummary['status'];
  drug: string;
  quantity: number;
  fromFacility: string;
  toFacility: string;
  batchNumber?: string;
  expiryDate?: string;
  sealNumber?: string;
  courierName?: string;
  courierPhone?: string;
  vehicle?: string;
  etaMinutes?: number;
}

export function TransferDetailModal({
  transfer,
  onClose,
}: {
  transfer: TransferDetailData | null;
  onClose: () => void;
}) {
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!transfer) return null;

  const handleAction = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <Modal
      onClose={onClose}
      labelledBy="transfer-modal-title"
      title={`Transfer Detail: ${transfer.reference}`}
      subtitle={`${transfer.fromFacility} → ${transfer.toFacility}`}
      icon={faTruckFast}
      className="transfer-modal"
      headerActions={
        <Badge status={transfer.status}>
          {transferStatusLabel(transfer.status)}
        </Badge>
      }
    >

        {feedback && (
          <div className="modal-feedback-banner">
            <FontAwesomeIcon icon={faCircleCheck} />
            <span>{feedback}</span>
          </div>
        )}

        <div className="modal-body">
          {/* Key metadata grid */}
          <div className="transfer-summary-grid">
            <div className="summary-item">
              <span className="summary-label">Commodity</span>
              <strong className="summary-value">
                {transfer.quantity} {transfer.drug}
              </strong>
            </div>
            <div className="summary-item">
              <span className="summary-label">Batch & Expiry</span>
              <strong className="summary-value">
                {transfer.batchNumber ?? 'B209'} · Exp {transfer.expiryDate ?? '10/2027'}
              </strong>
            </div>
            <div className="summary-item">
              <span className="summary-label">Tamper Seal</span>
              <strong className="summary-value">
                #{transfer.sealNumber ?? '7842'} (Intact)
              </strong>
            </div>
            <div className="summary-item">
              <span className="summary-label">Courier & Vehicle</span>
              <strong className="summary-value">
                {transfer.courierName ?? 'Ade Okafor'} (Bajaj Boxer)
              </strong>
            </div>
          </div>

          {/* Stepper Timeline */}
          <div className="transfer-timeline-card">
            <h4>Transfer Lifecycle & Evidence</h4>
            <OrderTimeline
              currentIndex={3}
              etaLabel={`ETA ${transfer.etaMinutes ?? 4} min to ${transfer.toFacility}`}
              steps={[
                {
                  title: '07:45 · Request Created',
                  detail: `${transfer.toFacility} reported stockout`,
                },
                {
                  title: '07:51 · Source Custodian Confirmed',
                  detail: `${transfer.fromFacility} reserved stock (safety floor untouched)`,
                },
                {
                  title: `07:58 · Tamper Seal #${transfer.sealNumber ?? '7842'} Verified & Dispatched`,
                  detail: `Released to courier ${transfer.courierName ?? 'Ade Okafor'}`,
                  icon: faShieldHalved,
                },
                {
                  title: '08:02 · In Transit',
                  detail: `ETA ${transfer.etaMinutes ?? 4} min to ${transfer.toFacility}`,
                  icon: faTruckFast,
                },
                {
                  title: 'Pending · Custody Verification PIN',
                  detail: 'Receiver must verify 4-digit code (e.g. 5082) on delivery',
                  icon: faKey,
                },
              ]}
            />
          </div>

          {/* Exception Workbench Actions */}
          <div className="modal-actions-section">
            <h4>LGA Operator Exception Controls</h4>
            <div className="action-buttons-row">
              <Button
                variant="secondary"
                icon={faPhone}
                onClick={() => handleAction('Calling Ade Okafor (+234 801 000 0010)...')}
              >
                Call Courier
              </Button>
              <Button
                variant="secondary"
                icon={faKey}
                onClick={() =>
                  handleAction('Handover reset issued: Authorized single-use PIN sent to receiver.')
                }
              >
                Reset PIN (5082)
              </Button>
              <Button
                variant="secondary"
                icon={faBoxesStacked}
                onClick={() =>
                  handleAction('Emergency buffer dispatched from Ota Central Medical Store.')
                }
              >
                Central Store Buffer
              </Button>
              <Button
                variant="danger"
                icon={faRotateRight}
                onClick={() =>
                  handleAction('Transfer re-assigned to backup courier Babatunde Alabi.')
                }
              >
                Reassign Courier
              </Button>
            </div>
          </div>
        </div>
    </Modal>
  );
}

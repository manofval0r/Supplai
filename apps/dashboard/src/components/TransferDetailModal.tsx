'use client';

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTruckFast,
  faXmark,
  faShieldHalved,
  faCircleCheck,
  faPhone,
  faRotateRight,
  faBoxesStacked,
  faKey,
} from '@fortawesome/free-solid-svg-icons';
import { transferStatusLabel } from '../lib/statusLabels';
import type { TransferSummary } from '@supplai/contracts';

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
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container transfer-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="transfer-modal-title"
      >
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-icon">
              <FontAwesomeIcon icon={faTruckFast} />
            </span>
            <div>
              <h3 id="transfer-modal-title">Transfer Detail: {transfer.reference}</h3>
              <p className="modal-subtitle">
                {transfer.fromFacility} → {transfer.toFacility}
              </p>
            </div>
          </div>
          <div className="modal-header-actions">
            <span className={`status status-${transfer.status}`}>
              {transferStatusLabel(transfer.status)}
            </span>
            <button
              type="button"
              className="modal-close-btn"
              onClick={onClose}
              aria-label="Close transfer modal"
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>
        </div>

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
            <div className="timeline-steps">
              <div className="timeline-step is-complete">
                <div className="step-circle">
                  <FontAwesomeIcon icon={faCircleCheck} />
                </div>
                <div className="step-content">
                  <strong>07:45 · Request Created</strong>
                  <p>{transfer.toFacility} reported stockout</p>
                </div>
              </div>

              <div className="timeline-step is-complete">
                <div className="step-circle">
                  <FontAwesomeIcon icon={faCircleCheck} />
                </div>
                <div className="step-content">
                  <strong>07:51 · Source Custodian Confirmed</strong>
                  <p>{transfer.fromFacility} reserved stock (safety floor untouched)</p>
                </div>
              </div>

              <div className="timeline-step is-complete">
                <div className="step-circle">
                  <FontAwesomeIcon icon={faShieldHalved} />
                </div>
                <div className="step-content">
                  <strong>07:58 · Tamper Seal #{transfer.sealNumber ?? '7842'} Verified & Dispatched</strong>
                  <p>Released to courier {transfer.courierName ?? 'Ade Okafor'}</p>
                </div>
              </div>

              <div className="timeline-step is-current">
                <div className="step-circle">
                  <FontAwesomeIcon icon={faTruckFast} />
                </div>
                <div className="step-content">
                  <strong>08:02 · In Transit</strong>
                  <p>ETA {transfer.etaMinutes ?? 4} min to {transfer.toFacility}</p>
                </div>
              </div>

              <div className="timeline-step is-future">
                <div className="step-circle">
                  <FontAwesomeIcon icon={faKey} />
                </div>
                <div className="step-content">
                  <strong>Pending · Custody Verification PIN</strong>
                  <p>Receiver must verify 4-digit code (e.g. 5082) on delivery</p>
                </div>
              </div>
            </div>
          </div>

          {/* Exception Workbench Actions */}
          <div className="modal-actions-section">
            <h4>LGA Operator Exception Controls</h4>
            <div className="action-buttons-row">
              <button
                type="button"
                className="action-pill-btn"
                onClick={() => handleAction('Calling Ade Okafor (+234 801 000 0010)...')}
              >
                <FontAwesomeIcon icon={faPhone} /> Call Courier
              </button>
              <button
                type="button"
                className="action-pill-btn"
                onClick={() =>
                  handleAction('Handover reset issued: Authorized single-use PIN sent to receiver.')
                }
              >
                <FontAwesomeIcon icon={faKey} /> Reset PIN (5082)
              </button>
              <button
                type="button"
                className="action-pill-btn"
                onClick={() =>
                  handleAction('Emergency buffer dispatched from Ota Central Medical Store.')
                }
              >
                <FontAwesomeIcon icon={faBoxesStacked} /> Central Store Buffer
              </button>
              <button
                type="button"
                className="action-pill-btn is-danger"
                onClick={() =>
                  handleAction('Transfer re-assigned to backup courier Babatunde Alabi.')
                }
              >
                <FontAwesomeIcon icon={faRotateRight} /> Reassign Courier
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

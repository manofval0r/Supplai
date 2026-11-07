'use client';

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFlask,
  faPlay,
  faForwardStep,
  faRotateRight,
  faCircleCheck,
  faUserGear,
  faSliders,
} from '@fortawesome/free-solid-svg-icons';

export interface ScenarioStep {
  tick: number;
  label: string;
  detail: string;
  owner: string;
  evidence: string;
}

const SCENARIO_1_STEPS: ScenarioStep[] = [
  {
    tick: 1,
    label: '1/5 · Stockout Request Created',
    detail: 'Aiyetoro Central PHC requests 20 ORS sachets due to zero on-hand stock.',
    owner: 'Requester (Aiyetoro Central)',
    evidence: 'Inbound request event #EV-101 logged in database',
  },
  {
    tick: 2,
    label: '2/5 · Source Custodian Confirmed',
    detail: 'Idera PHC (Demo PHC B) confirms 20 ORS sachets. Safety floor (20 sachets) protected.',
    owner: 'Source Custodian (Idera PHC)',
    evidence: 'Authorization #AUTH-402, Batch B209 verified',
  },
  {
    tick: 3,
    label: '3/5 · Courier Dispatched & Sealed',
    detail: 'Ade Okafor dispatched with sealed tamper crate #7842.',
    owner: 'Courier (Ade Okafor)',
    evidence: 'Tamper seal #7842 scanned, 4-digit PIN generated',
  },
  {
    tick: 4,
    label: '4/5 · In Transit on Corridor',
    detail: 'Rider moving along Aiyetoro–Idera road. Real-time GPS stream active.',
    owner: 'Courier (Ade Okafor)',
    evidence: 'OSM telemetry active, ETA 4 min',
  },
  {
    tick: 5,
    label: '5/5 · Receiver Custody Verified',
    detail: 'Aiyetoro Central enters Handover PIN 5082. Paired stock movements written to ledger.',
    owner: 'Receiver (Aiyetoro Central)',
    evidence: 'Movement #MOV-901 (-20) & #MOV-902 (+20) committed transactionally',
  },
];

export function ScenarioLabControls({
  onScenarioStepChange,
}: {
  onScenarioStepChange?: (step: ScenarioStep) => void;
}) {
  const [currentTick, setCurrentTick] = useState<number>(4); // Default to in-transit for live view
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [toast, setToast] = useState<string | null>(null);

  const step = SCENARIO_1_STEPS[currentTick - 1] ?? SCENARIO_1_STEPS[0]!;

  const handleNextTick = () => {
    const nextTick = currentTick >= 5 ? 1 : currentTick + 1;
    setCurrentTick(nextTick);
    const nextStep = SCENARIO_1_STEPS[nextTick - 1] ?? SCENARIO_1_STEPS[0]!;
    onScenarioStepChange?.(nextStep);
    setToast(`Advanced to tick ${nextTick}/5: ${nextStep.label}`);
    setTimeout(() => setToast(null), 3000);
  };

  const handleReplay = () => {
    setCurrentTick(1);
    const firstStep = SCENARIO_1_STEPS[0]!;
    onScenarioStepChange?.(firstStep);
    setToast('Replaying Scenario 1 from tick 1 (Stockout Created)...');
    setTimeout(() => setToast(null), 3000);
  };

  const handleReset = () => {
    setCurrentTick(4);
    const resetStep = SCENARIO_1_STEPS[3] ?? SCENARIO_1_STEPS[0]!;
    onScenarioStepChange?.(resetStep);
    setToast('Reset to default in-transit demonstration state.');
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className={`scenario-lab-bar ${isExpanded ? 'is-expanded' : ''}`}>
      <div className="lab-bar-header">
        <div className="lab-title-group">
          <span className="lab-badge">
            <FontAwesomeIcon icon={faFlask} /> SCENARIO LAB
          </span>
          <span className="lab-scenario-name">
            Scenario 1: Authorised Ambient Transfer (Reference)
          </span>
          <span className="lab-current-tick">{step.label}</span>
        </div>

        <div className="lab-controls-group">
          <button
            type="button"
            className="lab-btn"
            onClick={handleNextTick}
            title="Advance to next event tick"
          >
            <FontAwesomeIcon icon={faForwardStep} /> Next Event
          </button>
          <button
            type="button"
            className="lab-btn"
            onClick={handleReplay}
            title="Replay entire scenario"
          >
            <FontAwesomeIcon icon={faPlay} /> Replay
          </button>
          <button
            type="button"
            className="lab-btn"
            onClick={handleReset}
            title="Reset baseline fixtures"
          >
            <FontAwesomeIcon icon={faRotateRight} /> Reset
          </button>
          <button
            type="button"
            className="lab-btn-toggle"
            onClick={() => setIsExpanded(!isExpanded)}
            title="Toggle Scenario Details"
          >
            <FontAwesomeIcon icon={faSliders} />
          </button>
        </div>
      </div>

      {toast && (
        <div className="lab-toast-message">
          <FontAwesomeIcon icon={faCircleCheck} /> {toast}
        </div>
      )}

      {isExpanded && (
        <div className="lab-details-drawer">
          <div className="lab-details-grid">
            <div className="lab-detail-col">
              <span className="lab-meta-label">Event Detail:</span>
              <p className="lab-meta-value">{step.detail}</p>
            </div>
            <div className="lab-detail-col">
              <span className="lab-meta-label">Next Accountable Owner:</span>
              <strong className="lab-meta-value highlight-owner">
                <FontAwesomeIcon icon={faUserGear} /> {step.owner}
              </strong>
            </div>
            <div className="lab-detail-col">
              <span className="lab-meta-label">Auditable Evidence:</span>
              <p className="lab-meta-value">{step.evidence}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

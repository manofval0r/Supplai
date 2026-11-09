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
  faBullseye,
} from '@fortawesome/free-solid-svg-icons';
import type { ScenarioId } from '@supplai/contracts';
import { Badge } from './ui';

export interface ScenarioStep {
  tick: number;
  label: string;
  detail: string;
  owner: string;
  evidence: string;
}

export interface ScenarioCatalogItem {
  id: ScenarioId;
  name: string;
  learningGoal: string;
  expectedOutcome: string;
  defaultTick: number;
  steps: ScenarioStep[];
}

export const SCENARIO_LIBRARY: Record<ScenarioId, ScenarioCatalogItem> = {
  'authorised-ambient-transfer': {
    id: 'authorised-ambient-transfer',
    name: 'Scenario 1: Authorised Ambient Transfer (Reference)',
    learningGoal: 'Golden path: end-to-end ORS transfer with safety-floor check, tamper seal, and PIN handover.',
    expectedOutcome: 'authorised_transfer_received',
    defaultTick: 4,
    steps: [
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
    ],
  },
  'source-safety-floor-breach': {
    id: 'source-safety-floor-breach',
    name: 'Scenario 2: Source Safety-Floor Protection',
    learningGoal: 'Source clinic inventory must never drop below 20 units; surplus is capped and remainder escalated.',
    expectedOutcome: 'declined_safety_floor_protected',
    defaultTick: 3,
    steps: [
      {
        tick: 1,
        label: '1/4 · High Demand Request Created',
        detail: 'Aiyetoro Central requests 60 ORS sachets during seasonal surge.',
        owner: 'Requester (Aiyetoro Central)',
        evidence: 'Request #REQ-304 received via mobile console',
      },
      {
        tick: 2,
        label: '2/4 · Safety Floor Boundary Evaluated',
        detail: 'System evaluates Idera PHC stock (50 units). Protecting 30-unit safety floor allows max 20 surplus.',
        owner: 'System Allocation Engine',
        evidence: 'Floor evaluation: On-hand 50 - Floor 30 = Max 20 transferable',
      },
      {
        tick: 3,
        label: '3/4 · Allocation Capped to 20 Units',
        detail: 'Source custodian approves capped 20 units; remaining 40 units blocked to protect local patients.',
        owner: 'Source Custodian (Idera PHC)',
        evidence: 'Capped release #REL-209 for 20 units, ledger reserve active',
      },
      {
        tick: 4,
        label: '4/4 · Deficit Escalated to Central Store',
        detail: 'System escalates 40 units deficit to Ota Central Medical Store for routine buffer dispatch.',
        owner: 'LGA Operations Dispatcher',
        evidence: 'Escalation ticket #ESC-810 created for LGA Medical Store',
      },
    ],
  },
  'shelf-batch-mismatch': {
    id: 'shelf-batch-mismatch',
    name: 'Scenario 3: Shelf & Batch Number Mismatch',
    learningGoal: 'Catch mismatch between app allocation and physical shelf stock at the source dispatch gate.',
    expectedOutcome: 'quarantined_shelf_mismatch',
    defaultTick: 2,
    steps: [
      {
        tick: 1,
        label: '1/3 · Allocation Dispatched for Batch B209',
        detail: 'System allocates 30 ORS sachets under lot Batch B209.',
        owner: 'System Allocation Engine',
        evidence: 'Dispatch order #ORD-501 issued for Batch B209',
      },
      {
        tick: 2,
        label: '2/3 · Physical Shelf Mismatch Flagged',
        detail: 'Dispenser scans shelf box and discovers Batch B201 instead of allocated B209.',
        owner: 'Source Custodian (Dispenser)',
        evidence: 'Barcode scan mismatch: physical B201 != allocated B209',
      },
      {
        tick: 3,
        label: '3/3 · Dispatch Halted & Lot Quarantined',
        detail: 'Dispatch blocked; lot placed in physical quarantine for pharmacist audit.',
        owner: 'Facility In-Charge',
        evidence: 'Quarantine notice #Q-018 logged; transfer aborted safely',
      },
    ],
  },
  'fefo-priority-reroute': {
    id: 'fefo-priority-reroute',
    name: 'Scenario 4: First-Expired, First-Out (FEFO) Priority',
    learningGoal: 'Automate FEFO distribution by allocating stock expiring soonest to high-throughput clinics.',
    expectedOutcome: 'rerouted_fefo_priority',
    defaultTick: 3,
    steps: [
      {
        tick: 1,
        label: '1/5 · Urgent Request for Zinc Dispersible',
        detail: 'Aiyetoro Central requests 40 Zinc 20 mg dispersible tablets.',
        owner: 'Requester (Aiyetoro Central)',
        evidence: 'Inbound request for Zinc 20 mg',
      },
      {
        tick: 2,
        label: '2/5 · FEFO Comparator Evaluates Batches',
        detail: 'Algorithm compares Batch B209 (Exp: 6 mo) vs Batch B214 (Exp: 24 mo) across 3 clinics.',
        owner: 'FEFO Optimization Algorithm',
        evidence: 'Shelf life delta: B209 (180 days) prioritized over B214 (720 days)',
      },
      {
        tick: 3,
        label: '3/5 · Near-Expiry Batch B209 Allocated',
        detail: 'Batch B209 selected to prevent medicine expiry wastage in lower-volume facility.',
        owner: 'Source Custodian',
        evidence: 'Transfer voucher #FEFO-88 specifies Batch B209 (Exp 10/2026)',
      },
      {
        tick: 4,
        label: '4/5 · Courier Dispatched with Priority Seal',
        detail: 'Courier Babatunde Alabi dispatched with yellow FEFO-priority tamper seal.',
        owner: 'Courier (Babatunde Alabi)',
        evidence: 'Priority tamper seal #FEFO-770 active',
      },
      {
        tick: 5,
        label: '5/5 · Custody Transferred & Waste Prevented',
        detail: 'Receiving clinic logs Batch B209 for fast-track dispensing to active pediatric patients.',
        owner: 'Receiver (Aiyetoro Central)',
        evidence: 'Dispense queue #DQ-44 committed; zero expired wastage',
      },
    ],
  },
  'delayed-rider-eta-adjustment': {
    id: 'delayed-rider-eta-adjustment',
    name: 'Scenario 5: Courier Delay & Dynamic ETA Adjustment',
    learningGoal: 'Handle en-route delays gracefully with dynamic telemetry ETA updates and supervisor notification.',
    expectedOutcome: 'delayed_eta_escalated',
    defaultTick: 4,
    steps: [
      {
        tick: 1,
        label: '1/5 · Emergency Transfer Dispatched',
        detail: 'Iyana-Ipaja PHC emergency ORS replenishment departs Idera PHC (initial ETA 6 min).',
        owner: 'Courier (Ade Okafor)',
        evidence: 'Courier dispatch logged at 13:03',
      },
      {
        tick: 2,
        label: '2/5 · Heavy Rain & Road Obstruction',
        detail: 'Rider encounters flooded culvert on corridor; speed drops below 5 km/h.',
        owner: 'Courier (Ade Okafor)',
        evidence: 'Telemetry anomaly flag: vehicle speed < 5 km/h for > 5 min',
      },
      {
        tick: 3,
        label: '3/5 · Dynamic ETA Recalibrated',
        detail: 'System dynamically adjusts ETA from 6 min to 28 min based on GPS velocity vector.',
        owner: 'Telemetry Processing Worker',
        evidence: 'ETA updated from 13:09 to 13:31 in Redis state',
      },
      {
        tick: 4,
        label: '4/5 · Automated SMS Alert to Clinic',
        detail: 'Automated SMS dispatched to receiving nurse explaining delay and updated ETA.',
        owner: 'SMS Notification Gateway',
        evidence: 'SMS payload: "Courier delayed by weather; ETA adjusted to 28 min"',
      },
      {
        tick: 5,
        label: '5/5 · Safe Arrival & Escalation Closed',
        detail: 'Courier arrives safely at receiving clinic without temperature excursion.',
        owner: 'Receiver & Courier',
        evidence: 'Inspection passed; delay anomaly resolved and closed',
      },
    ],
  },
  'refusal-at-receipt-tamper-seal': {
    id: 'refusal-at-receipt-tamper-seal',
    name: 'Scenario 6: Broken Tamper Seal & Refusal at Receipt',
    learningGoal: 'Enforce strict security protocol: reject crate with broken seal #7842, log incident, and quarantine cargo.',
    expectedOutcome: 'refused_tamper_seal_broken',
    defaultTick: 4,
    steps: [
      {
        tick: 1,
        label: '1/5 · Emergency Stock Dispatched & Sealed',
        detail: 'Crate sealed with numbered plastic tamper seal #7842 at Idera PHC.',
        owner: 'Source Custodian',
        evidence: 'Seal #7842 recorded on outbound manifest',
      },
      {
        tick: 2,
        label: '2/5 · Courier Transits Corridor',
        detail: 'Rider carries insulated carrier box across the Ado-Odo corridor.',
        owner: 'Courier',
        evidence: 'Corridor waypoint scans recorded',
      },
      {
        tick: 3,
        label: '3/5 · Courier Arrives at Receiving Gate',
        detail: 'Courier presents crate to receiving nurse at Aiyetoro Central.',
        owner: 'Courier & Receiver',
        evidence: 'Arrival geofence triggered at receiving clinic',
      },
      {
        tick: 4,
        label: '4/5 · Broken Seal Discovered on Inspection',
        detail: 'Receiving nurse identifies broken tamper seal #7842 with evidence of tampering.',
        owner: 'Receiver (Nurse Fatima)',
        evidence: 'Inspection photo uploaded showing severed seal #7842',
      },
      {
        tick: 5,
        label: '5/5 · Custody Refused & Incident Escalated',
        detail: 'Receipt refused; custody NOT transferred; incident logged for LGA Pharmacist investigation.',
        owner: 'Receiver & LGA Pharmacist',
        evidence: 'Incident report #INC-991 escalated; stock quarantined',
      },
    ],
  },
  'demand-shock-lga-buffer': {
    id: 'demand-shock-lga-buffer',
    name: 'Scenario 7: Demand Shock & LGA Buffer Escalation',
    learningGoal: 'Simulate sudden cluster stockouts triggering supervisor authorization of central warehouse reserve stock.',
    expectedOutcome: 'escalated_lga_buffer_release',
    defaultTick: 3,
    steps: [
      {
        tick: 1,
        label: '1/5 · Gastroenteritis Surge in Ward 2',
        detail: 'Three clinics simultaneously request 40 ORS sachets each due to local water contamination surge.',
        owner: 'Clinics in Ward 2',
        evidence: '3 cluster requests received within 15 minutes',
      },
      {
        tick: 2,
        label: '2/5 · Peer Balancing Exhausted',
        detail: 'Peer clinic transfer capacity insufficient to satisfy demand without breaching safety floors.',
        owner: 'System Demand Balancing Engine',
        evidence: 'Corridor surplus (35 units) < Aggregate demand (120 units)',
      },
      {
        tick: 3,
        label: '3/5 · Cluster Escalated to LGA Command',
        detail: 'System automatically flags demand shock cluster on LGA Dashboard with high-priority amber alert.',
        owner: 'System Monitoring Engine',
        evidence: 'Cluster alert #CLU-402 raised to LGA Supervisor',
      },
      {
        tick: 4,
        label: '4/5 · LGA Supervisor Releases Buffer',
        detail: 'Supervisor authorizes emergency release of 200 ORS sachets from Ota Central Medical Store buffer.',
        owner: 'LGA Health Supervisor',
        evidence: 'Supervisor release approval #SUP-771 with digital signature',
      },
      {
        tick: 5,
        label: '5/5 · Central Buffer Deployed & Outbreak Contained',
        detail: 'Buffer batch dispatched with express vehicle to Ward 2 clinics; stockouts averted.',
        owner: 'Central Store Logistics Team',
        evidence: 'Central buffer dispatch #CMS-092 confirmed delivered',
      },
    ],
  },
};

export function ScenarioLabControls({
  onScenarioStepChange,
}: {
  onScenarioStepChange?: (step: ScenarioStep) => void;
}) {
  const [selectedScenarioId, setSelectedScenarioId] = useState<ScenarioId>('authorised-ambient-transfer');
  const [currentTick, setCurrentTick] = useState<number>(4);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [toast, setToast] = useState<string | null>(null);

  const scenario = SCENARIO_LIBRARY[selectedScenarioId];
  const maxTicks = scenario.steps.length;
  const clampedTick = Math.min(Math.max(1, currentTick), maxTicks);
  const step = scenario.steps[clampedTick - 1] ?? scenario.steps[0]!;

  const handleScenarioChange = (newId: ScenarioId) => {
    setSelectedScenarioId(newId);
    const newScenario = SCENARIO_LIBRARY[newId];
    const initialTick = newScenario.defaultTick;
    setCurrentTick(initialTick);
    const initialStep = newScenario.steps[initialTick - 1] ?? newScenario.steps[0]!;
    onScenarioStepChange?.(initialStep);
    setToast(`Loaded ${newScenario.name}`);
    setTimeout(() => setToast(null), 3000);
  };

  const handleNextTick = () => {
    const nextTick = clampedTick >= maxTicks ? 1 : clampedTick + 1;
    setCurrentTick(nextTick);
    const nextStep = scenario.steps[nextTick - 1] ?? scenario.steps[0]!;
    onScenarioStepChange?.(nextStep);
    setToast(`Step ${nextTick}/${maxTicks}: ${nextStep.label}`);
    setTimeout(() => setToast(null), 3000);
  };

  const handleReplay = () => {
    setCurrentTick(1);
    const firstStep = scenario.steps[0]!;
    onScenarioStepChange?.(firstStep);
    setToast(`Replaying ${scenario.name} from step 1...`);
    setTimeout(() => setToast(null), 3000);
  };

  const handleReset = () => {
    const defaultTick = scenario.defaultTick;
    setCurrentTick(defaultTick);
    const resetStep = scenario.steps[defaultTick - 1] ?? scenario.steps[0]!;
    onScenarioStepChange?.(resetStep);
    setToast(`Reset ${scenario.name} to baseline state.`);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className={`scenario-lab-bar ${isExpanded ? 'is-expanded' : ''}`}>
      <div className="lab-bar-header">
        <div className="lab-title-group">
          <span className="lab-badge">
            <FontAwesomeIcon icon={faFlask} /> SCENARIO LAB
          </span>
          <select
            className="lab-scenario-select"
            value={selectedScenarioId}
            onChange={(e) => handleScenarioChange(e.target.value as ScenarioId)}
          >
            {Object.values(SCENARIO_LIBRARY).map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
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
              <span className="lab-meta-label">
                <FontAwesomeIcon icon={faBullseye} /> Learning Goal:
              </span>
              <p className="lab-meta-value">{scenario.learningGoal}</p>
              <div className="lab-meta-gap">
                <span className="lab-meta-label">Auditable Outcome:</span>
                <Badge tone="info" className="lab-outcome-badge">
                  {scenario.expectedOutcome}
                </Badge>
              </div>
            </div>
            <div className="lab-detail-col">
              <span className="lab-meta-label">Next Accountable Owner:</span>
              <strong className="lab-meta-value highlight-owner">
                <FontAwesomeIcon icon={faUserGear} /> {step.owner}
              </strong>
              <div className="lab-meta-gap">
                <span className="lab-meta-label">Event Detail:</span>
                <p className="lab-meta-value">{step.detail}</p>
              </div>
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

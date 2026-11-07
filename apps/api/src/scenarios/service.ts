import {
  scenarioRunSchema,
  type CanonicalEvent,
  type ScenarioDefinition,
  type ScenarioId,
  type ScenarioOutcome,
  type ScenarioRun,
} from '@supplai/contracts';

const fixtureVersion = '1.0.0';

interface ScenarioPack {
  definition: ScenarioDefinition;
  events: CanonicalEvent[];
}

export const SCENARIO_CATALOG: Record<ScenarioId, ScenarioPack> = {
  'authorised-ambient-transfer': {
    definition: {
      id: 'authorised-ambient-transfer',
      name: 'Scenario 1: Authorised Ambient Transfer (Reference)',
      learningGoal:
        'Verify end-to-end peer transfer with source confirmation, safety floor check, tamper seal, and 4-digit PIN verification.',
      expectedOutcome: 'authorised_transfer_received',
      nextAccountableOwner: 'facility_requester',
      eventCount: 5,
    },
    events: [
      {
        sequence: 1,
        type: 'request_created',
        occurredAt: '2026-11-05T09:00:00.000Z',
        actorRole: 'facility_requester',
        label: 'Aiyetoro Central PHC requests 20 ORS sachets',
      },
      {
        sequence: 2,
        type: 'source_confirmation_requested',
        occurredAt: '2026-11-05T09:01:00.000Z',
        actorRole: 'system',
        label: 'Idera PHC (Demo PHC B) receives reservation request',
      },
      {
        sequence: 3,
        type: 'source_released',
        occurredAt: '2026-11-05T09:02:00.000Z',
        actorRole: 'source_custodian',
        label: 'Batch ORS-DEMO-01 released above the safety floor with tamper seal 7842',
      },
      {
        sequence: 4,
        type: 'rider_assigned',
        occurredAt: '2026-11-05T09:03:00.000Z',
        actorRole: 'system',
        label: 'Ade Okafor dispatched on Bajaj Boxer (LAG-782-KT)',
      },
      {
        sequence: 5,
        type: 'received',
        occurredAt: '2026-11-05T09:12:00.000Z',
        actorRole: 'facility_requester',
        label: 'Receiving facility accepts ambient handover with PIN 5082',
      },
    ],
  },

  'source-safety-floor-breach': {
    definition: {
      id: 'source-safety-floor-breach',
      name: 'Scenario 2: Source Safety Floor Protection',
      learningGoal:
        'Ensure a supplying facility cannot deplete stock below its local safety floor threshold; capped transfer or decline.',
      expectedOutcome: 'declined_safety_floor_protected',
      nextAccountableOwner: 'lga_pharmacist',
      eventCount: 4,
    },
    events: [
      {
        sequence: 1,
        type: 'request_created',
        occurredAt: '2026-11-05T10:00:00.000Z',
        actorRole: 'facility_requester',
        label: 'Oke-Odo PHC requests 60 Zinc tablets from Idera PHC',
      },
      {
        sequence: 2,
        type: 'source_confirmation_requested',
        occurredAt: '2026-11-05T10:01:00.000Z',
        actorRole: 'system',
        label: 'Safety floor algorithm evaluates Idera PHC on-hand stock (50 units)',
      },
      {
        sequence: 3,
        type: 'source_released',
        occurredAt: '2026-11-05T10:02:00.000Z',
        actorRole: 'source_custodian',
        label: 'Source declines full 60 request; surplus capped to 20 to protect local safety floor (30)',
      },
      {
        sequence: 4,
        type: 'escalated',
        occurredAt: '2026-11-05T10:03:00.000Z',
        actorRole: 'system',
        label: 'Remaining 40 units escalated to Ota Central Medical Store for routine replenishment',
      },
    ],
  },

  'shelf-batch-mismatch': {
    definition: {
      id: 'shelf-batch-mismatch',
      name: 'Scenario 3: Shelf & Batch Number Mismatch',
      learningGoal:
        'Catch mismatch between app allocation and physical shelf stock at the source dispatch gate.',
      expectedOutcome: 'quarantined_shelf_mismatch',
      nextAccountableOwner: 'source_custodian',
      eventCount: 3,
    },
    events: [
      {
        sequence: 1,
        type: 'request_created',
        occurredAt: '2026-11-05T11:00:00.000Z',
        actorRole: 'facility_requester',
        label: 'Ajegunle PHC requests 30 ORS sachets',
      },
      {
        sequence: 2,
        type: 'source_confirmation_requested',
        occurredAt: '2026-11-05T11:01:00.000Z',
        actorRole: 'source_custodian',
        label: 'Physical inspection detects Batch B201 on shelf while system allocated Batch B209',
      },
      {
        sequence: 3,
        type: 'escalated',
        occurredAt: '2026-11-05T11:02:00.000Z',
        actorRole: 'source_custodian',
        label: 'Dispatch halted; lot quarantined for supervisor reconciliation',
      },
    ],
  },

  'fefo-priority-reroute': {
    definition: {
      id: 'fefo-priority-reroute',
      name: 'Scenario 4: First-Expired, First-Out (FEFO) Priority',
      learningGoal:
        'Automate FEFO distribution by allocating stock expiring soonest to high-throughput clinics.',
      expectedOutcome: 'rerouted_fefo_priority',
      nextAccountableOwner: 'courier',
      eventCount: 5,
    },
    events: [
      {
        sequence: 1,
        type: 'request_created',
        occurredAt: '2026-11-05T12:00:00.000Z',
        actorRole: 'facility_requester',
        label: 'Aiyetoro Central PHC requests 40 Zinc 20 mg dispersible tablets',
      },
      {
        sequence: 2,
        type: 'source_confirmation_requested',
        occurredAt: '2026-11-05T12:01:00.000Z',
        actorRole: 'system',
        label: 'Algorithm compares Batch B209 (Exp: 6 mo) vs Batch B214 (Exp: 24 mo)',
      },
      {
        sequence: 3,
        type: 'source_released',
        occurredAt: '2026-11-05T12:02:00.000Z',
        actorRole: 'source_custodian',
        label: 'Batch B209 selected under FEFO rules to prevent expiry wastage',
      },
      {
        sequence: 4,
        type: 'rider_assigned',
        occurredAt: '2026-11-05T12:03:00.000Z',
        actorRole: 'system',
        label: 'Courier Babatunde Alabi assigned for express delivery',
      },
      {
        sequence: 5,
        type: 'received',
        occurredAt: '2026-11-05T12:14:00.000Z',
        actorRole: 'facility_requester',
        label: 'Batch B209 accepted; ledger updated with near-expiry usage flag',
      },
    ],
  },

  'delayed-rider-eta-adjustment': {
    definition: {
      id: 'delayed-rider-eta-adjustment',
      name: 'Scenario 5: Courier Delay & Dynamic ETA Adjustment',
      learningGoal:
        'Handle en-route delays gracefully with dynamic telemetry ETA updates and supervisor notification.',
      expectedOutcome: 'delayed_eta_escalated',
      nextAccountableOwner: 'dispatcher',
      eventCount: 5,
    },
    events: [
      {
        sequence: 1,
        type: 'request_created',
        occurredAt: '2026-11-05T13:00:00.000Z',
        actorRole: 'facility_requester',
        label: 'Iyana-Ipaja PHC requests 25 ORS sachets',
      },
      {
        sequence: 2,
        type: 'source_released',
        occurredAt: '2026-11-05T13:02:00.000Z',
        actorRole: 'source_custodian',
        label: 'Stock released and sealed under crate #7901',
      },
      {
        sequence: 3,
        type: 'rider_assigned',
        occurredAt: '2026-11-05T13:03:00.000Z',
        actorRole: 'system',
        label: 'Courier Ade Okafor departs Idera PHC (initial ETA 6 min)',
      },
      {
        sequence: 4,
        type: 'in_transit',
        occurredAt: '2026-11-05T13:10:00.000Z',
        actorRole: 'rider',
        label: 'Heavy rain & road obstruction encountered; courier updates delay flag',
      },
      {
        sequence: 5,
        type: 'escalated',
        occurredAt: '2026-11-05T13:11:00.000Z',
        actorRole: 'system',
        label: 'ETA dynamically adjusted to 28 min; automated SMS alert sent to receiver',
      },
    ],
  },

  'refusal-at-receipt-tamper-seal': {
    definition: {
      id: 'refusal-at-receipt-tamper-seal',
      name: 'Scenario 6: Broken Tamper Seal & Refusal at Receipt',
      learningGoal:
        'Enforce strict security protocol: reject crate with broken seal #7842, log incident, and quarantine cargo.',
      expectedOutcome: 'refused_tamper_seal_broken',
      nextAccountableOwner: 'lga_pharmacist',
      eventCount: 5,
    },
    events: [
      {
        sequence: 1,
        type: 'request_created',
        occurredAt: '2026-11-05T14:00:00.000Z',
        actorRole: 'facility_requester',
        label: 'Aiyetoro Central PHC requests emergency ORS replenishment',
      },
      {
        sequence: 2,
        type: 'source_released',
        occurredAt: '2026-11-05T14:02:00.000Z',
        actorRole: 'source_custodian',
        label: 'Crate sealed with tag #7842 and handed to courier',
      },
      {
        sequence: 3,
        type: 'rider_assigned',
        occurredAt: '2026-11-05T14:03:00.000Z',
        actorRole: 'system',
        label: 'Courier arrives at destination receiving gate',
      },
      {
        sequence: 4,
        type: 'receiving_inspected',
        occurredAt: '2026-11-05T14:15:00.000Z',
        actorRole: 'facility_requester',
        label: 'Receiving nurse identifies broken tamper seal #7842',
      },
      {
        sequence: 5,
        type: 'escalated',
        occurredAt: '2026-11-05T14:16:00.000Z',
        actorRole: 'facility_requester',
        label: 'Receipt refused; custody NOT transferred; incident logged for LGA Pharmacist investigation',
      },
    ],
  },

  'demand-shock-lga-buffer': {
    definition: {
      id: 'demand-shock-lga-buffer',
      name: 'Scenario 7: Demand Shock & LGA Buffer Escalation',
      learningGoal:
        'Simulate sudden cluster stockouts triggering supervisor authorization of central warehouse reserve stock.',
      expectedOutcome: 'escalated_lga_buffer_release',
      nextAccountableOwner: 'lga_director',
      eventCount: 5,
    },
    events: [
      {
        sequence: 1,
        type: 'request_created',
        occurredAt: '2026-11-05T15:00:00.000Z',
        actorRole: 'facility_requester',
        label: 'Acute gastroenteritis surge triggers 3 simultaneous clinic requests in Ward 2',
      },
      {
        sequence: 2,
        type: 'source_confirmation_requested',
        occurredAt: '2026-11-05T15:02:00.000Z',
        actorRole: 'system',
        label: 'Peer clinics insufficient to satisfy aggregate demand without breaching safety floors',
      },
      {
        sequence: 3,
        type: 'escalated',
        occurredAt: '2026-11-05T15:03:00.000Z',
        actorRole: 'system',
        label: 'Demand-shock algorithm escalates cluster to LGA Command Console',
      },
      {
        sequence: 4,
        type: 'source_released',
        occurredAt: '2026-11-05T15:05:00.000Z',
        actorRole: 'lga',
        label: 'LGA Supervisor approves 200 sachet buffer release from Ota Central Medical Store',
      },
      {
        sequence: 5,
        type: 'received',
        occurredAt: '2026-11-05T15:30:00.000Z',
        actorRole: 'facility_requester',
        label: 'Central store buffer batch delivered to Ward 2 clinics; outbreak contained',
      },
    ],
  },
};

export class ScenarioLabService {
  private activeScenarioId: ScenarioId = 'authorised-ambient-transfer';
  private readonly runs = new Map<ScenarioId, { cursor: number; started: boolean }>();

  private getRun(id: ScenarioId) {
    let run = this.runs.get(id);
    if (!run) {
      run = { cursor: 0, started: false };
      this.runs.set(id, run);
    }
    return run;
  }

  listScenarios(): ScenarioDefinition[] {
    return Object.values(SCENARIO_CATALOG).map((p) => p.definition);
  }

  setScenario(id: ScenarioId): ScenarioRun {
    this.activeScenarioId = id;
    return this.read(id);
  }

  start(scenarioId?: ScenarioId): ScenarioRun {
    const id = scenarioId ?? this.activeScenarioId;
    this.activeScenarioId = id;
    const run = this.getRun(id);
    run.cursor = 0;
    run.started = true;
    return this.read(id);
  }

  tick(scenarioId?: ScenarioId): ScenarioRun {
    const id = scenarioId ?? this.activeScenarioId;
    this.activeScenarioId = id;
    const run = this.getRun(id);
    if (!run.started) run.started = true;
    const pack = SCENARIO_CATALOG[id] ?? SCENARIO_CATALOG['authorised-ambient-transfer'];
    run.cursor = Math.min(run.cursor + 1, pack.events.length);
    return this.read(id);
  }

  replay(scenarioId?: ScenarioId): ScenarioRun {
    const id = scenarioId ?? this.activeScenarioId;
    this.activeScenarioId = id;
    const run = this.getRun(id);
    run.cursor = 1;
    run.started = true;
    return this.read(id);
  }

  reset(scenarioId?: ScenarioId): ScenarioRun {
    const id = scenarioId ?? this.activeScenarioId;
    this.activeScenarioId = id;
    const run = this.getRun(id);
    run.cursor = 0;
    run.started = false;
    return this.read(id);
  }

  resetAll(): void {
    this.runs.clear();
    this.activeScenarioId = 'authorised-ambient-transfer';
  }

  read(scenarioId?: ScenarioId): ScenarioRun {
    const id = scenarioId ?? this.activeScenarioId;
    const pack = SCENARIO_CATALOG[id] ?? SCENARIO_CATALOG['authorised-ambient-transfer'];
    const run = this.getRun(id);
    const completed = run.cursor === pack.events.length;
    const outcome: ScenarioOutcome | null = completed
      ? pack.definition.expectedOutcome
      : null;

    return scenarioRunSchema.parse({
      scenarioId: id,
      fixtureVersion,
      runId: `${id}-${fixtureVersion}`,
      cursor: run.cursor,
      state: run.started ? (completed ? 'completed' : 'running') : 'ready',
      outcome,
      events: pack.events.slice(0, run.cursor),
    });
  }
}

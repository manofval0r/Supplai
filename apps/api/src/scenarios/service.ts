import {
  scenarioRunSchema,
  type CanonicalEvent,
  type ScenarioRun,
} from '@supplai/contracts';

const scenarioId = 'authorised-ambient-transfer' as const;
const fixtureVersion = '1.0.0';

const fixture: CanonicalEvent[] = [
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
    label: 'Source custodian confirmation requested',
  },
  {
    sequence: 3,
    type: 'source_released',
    occurredAt: '2026-11-05T09:02:00.000Z',
    actorRole: 'source_custodian',
    label: 'Batch ORS-DEMO-01 released above the safety floor',
  },
  {
    sequence: 4,
    type: 'rider_assigned',
    occurredAt: '2026-11-05T09:03:00.000Z',
    actorRole: 'system',
    label: 'Demo rider assigned',
  },
  {
    sequence: 5,
    type: 'received',
    occurredAt: '2026-11-05T09:12:00.000Z',
    actorRole: 'facility_requester',
    label: 'Receiving facility accepts the ambient handover',
  },
];

export class ScenarioLabService {
  private cursor = 0;
  private started = false;

  start(): ScenarioRun {
    this.cursor = 0;
    this.started = true;
    return this.read();
  }

  tick(): ScenarioRun {
    if (!this.started) this.start();
    this.cursor = Math.min(this.cursor + 1, fixture.length);
    return this.read();
  }

  replay(): ScenarioRun {
    return this.read();
  }

  reset(): ScenarioRun {
    this.cursor = 0;
    this.started = false;
    return this.read();
  }

  read(): ScenarioRun {
    const completed = this.cursor === fixture.length;
    return scenarioRunSchema.parse({
      scenarioId,
      fixtureVersion,
      runId: `${scenarioId}-${fixtureVersion}`,
      cursor: this.cursor,
      state: this.started ? (completed ? 'completed' : 'running') : 'ready',
      outcome: completed ? 'authorised_transfer_received' : null,
      events: fixture.slice(0, this.cursor),
    });
  }
}

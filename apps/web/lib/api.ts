import type {
  LgaOverview,
  OperationalFailure,
  TransferSummary,
} from '@supplai/contracts';

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.EXPO_PUBLIC_API_URL ??
  'http://localhost:3000';

export type Commodity = 'ors' | 'zinc';

export interface OrderStatusEvent {
  sequence: number;
  type:
    | 'request_created'
    | 'source_confirmation_requested'
    | 'source_released'
    | 'rider_assigned'
    | 'picked_up'
    | 'in_transit'
    | 'received'
    | 'escalated';
  occurredAt: string;
  actorRole:
    'facility_requester' | 'source_custodian' | 'lga' | 'rider' | 'system';
  label: string;
}

export interface OrderDetail {
  reference: string;
  status:
    | 'awaiting_source_confirmation'
    | 'awaiting_dispatch'
    | 'rider_en_route'
    | 'received'
    | 'escalated'
    | 'needs_review';
  commodity: Commodity;
  quantity: number;
  sourceFacility: string;
  requestingFacility: string;
  sourceFacilityId?: string;
  requestingFacilityId?: string;
  transferReference: string | null;
  evidence: {
    commodity: Commodity;
    batchNumber: string;
    expiresOn: string;
    inspectedAt: string;
    condition: string;
    ambientOnly: boolean;
    quantityOnHand: number;
    safetyFloor: number;
    quantityRequested: number;
  };
  timeline: OrderStatusEvent[];
  allowedActions: string[];
  nextAccountableOwner: string;
}

export interface NotificationEvent {
  id: string;
  kind:
    | 'source_confirmation_requested'
    | 'source_released'
    | 'source_declined'
    | 'rider_assigned'
    | 'picked_up'
    | 'in_transit'
    | 'receiving_action_required'
    | 'received'
    | 'receipt_refused'
    | 'escalated';
  severity: 'info' | 'action' | 'critical';
  title: string;
  body: string;
  occurredAt: string;
  orderReference: string | null;
  deepLink: string | null;
  audience: 'facility_requester' | 'source_custodian' | 'rider' | 'lga';
}

export interface NotificationFeed {
  generatedAt: string;
  events: NotificationEvent[];
}

export interface AppRequestResult {
  status: 'offered' | 'unmatched';
  requestReference: string | null;
  sourceFacility: string | null;
  message: string;
}

export interface OrderActionResult {
  accepted: boolean;
  message: string;
  order: OrderDetail | null;
}

interface ApiErrorBody {
  error?: string;
}

class SupplaiApiError extends Error {
  status: number;
  body: ApiErrorBody;
  constructor(status: number, body: ApiErrorBody) {
    super(body.error ?? `Request failed (${status})`);
    this.name = 'SupplaiApiError';
    this.status = status;
    this.body = body;
  }
}

async function requestJson(path: string, init?: RequestInit): Promise<unknown> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 1500);
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
      signal: controller.signal,
      ...init,
    });
    const body = (await response.json()) as ApiErrorBody;
    if (!response.ok) {
      throw new SupplaiApiError(response.status, body);
    }
    return body;
  } finally {
    clearTimeout(timeout);
  }
}

export const supplaiApi = {
  createRequest: (input: {
    facilityPhone: string;
    commodity: Commodity;
    quantity: number;
  }): Promise<AppRequestResult> =>
    requestJson('/api/requests', {
      method: 'POST',
      body: JSON.stringify(input),
    }) as Promise<AppRequestResult>,
  getOrder: (reference: string): Promise<OrderDetail> =>
    requestJson(
      `/api/orders/${encodeURIComponent(reference)}`,
    ) as Promise<OrderDetail>,
  actOnOrder: (
    reference: string,
    action: Record<string, unknown>,
  ): Promise<OrderActionResult> =>
    requestJson(`/api/orders/${encodeURIComponent(reference)}/actions`, {
      method: 'POST',
      body: JSON.stringify(action),
    }) as Promise<OrderActionResult>,
  notifications: (query: {
    role: 'facility' | 'rider' | 'lga';
    facilityId?: string;
    riderName?: string;
  }): Promise<NotificationFeed> => {
    const params = new URLSearchParams({ role: query.role });
    if (query.facilityId) params.set('facilityId', query.facilityId);
    if (query.riderName) params.set('riderName', query.riderName);
    return requestJson(
      `/api/notifications?${params.toString()}`,
    ) as Promise<NotificationFeed>;
  },
  lgaOverview: (): Promise<LgaOverview> =>
    requestJson('/api/lga/overview') as Promise<LgaOverview>,
  lgaTransfers: (): Promise<TransferSummary[]> =>
    requestJson('/api/lga/transfers') as Promise<TransferSummary[]>,
  getTransfer: (reference: string): Promise<TransferSummary> =>
    requestJson(
      `/api/transfers/${encodeURIComponent(reference)}`,
    ) as Promise<TransferSummary>,
  operationsFailures: (): Promise<OperationalFailure[]> =>
    requestJson('/api/operations/failures') as Promise<OperationalFailure[]>,
};

export interface LgaDecisionItem {
  reference: string;
  fromFacility: string;
  toFacility: string;
  drug: string;
  quantity: number;
  status: TransferSummary['status'];
  priority: 'critical' | 'attention' | 'normal';
  attentionReason: string;
  nextOwner: string;
  safetyFloorEvidence: string;
}

export interface LgaDecisionBundle {
  source: 'live' | 'fixture';
  overview: LgaOverview;
  failures: OperationalFailure[];
  queue: LgaDecisionItem[];
}

const FIXTURE_LGA_OVERVIEW: LgaOverview = {
  lgaCode: 'ADO-OTA-LGA',
  generatedAt: '2026-11-14T12:00:00.000Z',
  metrics: {
    openStockouts: 2,
    transfersInFlight: 2,
    completedTransfers: 1,
    unmetRequests: 1,
    responseRate: 0.86,
  },
  transfers: [
    {
      id: '11111111-1111-4111-8111-111111111101',
      reference: 'SUP-409',
      fromFacility: 'Ota Ward Health Post',
      toFacility: 'Aiyetoro Central PHC',
      drug: 'ORS Co-Pack',
      quantity: 20,
      status: 'dispatched',
      createdAt: '2026-11-14T11:30:00.000Z',
      riderName: 'Ade Okafor',
      requestReference: 'REQ-409',
      dispatchedAt: '2026-11-14T11:42:00.000Z',
    },
    {
      id: '11111111-1111-4111-8111-111111111102',
      reference: 'SUP-412',
      fromFacility: 'Idera PHC',
      toFacility: 'Sango PHC',
      drug: 'Zinc Sulfate 20mg',
      quantity: 30,
      status: 'pending',
      createdAt: '2026-11-14T11:45:00.000Z',
      requestReference: 'REQ-412',
    },
    {
      id: '11111111-1111-4111-8111-111111111103',
      reference: 'SUP-404',
      fromFacility: 'LGA Central Store',
      toFacility: 'Ifo Border Clinic',
      drug: 'ORS 20.5g',
      quantity: 15,
      status: 'delivered',
      createdAt: '2026-11-14T09:10:00.000Z',
      riderName: 'Kemi Balogun',
      requestReference: 'REQ-404',
      dispatchedAt: '2026-11-14T09:20:00.000Z',
      deliveredAt: '2026-11-14T09:41:00.000Z',
    },
  ],
};

const FIXTURE_FAILURES: OperationalFailure[] = [
  {
    id: '22222222-2222-4222-8222-222222222201',
    category: 'proof_locked',
    reference: 'SUP-409',
    occurredAt: '2026-11-14T11:55:00.000Z',
    detail:
      'Awaiting 4-digit receiver PIN & tamper seal #7842 verification at Aiyetoro Central PHC.',
  },
  {
    id: '22222222-2222-4222-8222-222222222202',
    category: 'unmatched',
    reference: 'REQ-415',
    occurredAt: '2026-11-14T11:58:00.000Z',
    detail:
      'No peer clinic above 30-unit safety floor for 40 ORS sachets; escalated to LGA Central Store.',
  },
];

export function buildLgaDecisionQueue(
  transfers: TransferSummary[],
  failures: OperationalFailure[],
): LgaDecisionItem[] {
  const failureByRef = new Map(failures.map((f) => [f.reference, f]));
  return transfers.map((t) => {
    const failure = failureByRef.get(t.reference);
    const isCritical =
      t.status === 'failed' ||
      t.status === 'locked' ||
      failure?.category === 'proof_locked';
    const isAttention = !isCritical && t.status === 'pending';
    const priority = isCritical
      ? 'critical'
      : isAttention
        ? 'attention'
        : 'normal';

    const attentionReason = failure
      ? failure.detail
      : t.status === 'pending'
        ? 'Pending source custodian release or courier dispatch assignment.'
        : t.status === 'dispatched' || t.status === 'in_transit'
          ? `In transit with ${t.riderName ?? 'assigned courier'}; awaiting PIN handover.`
          : t.status === 'delivered'
            ? 'Receiver custody verified; paired ledger entries committed.'
            : 'Requires LGA supervisor review.';

    const nextOwner =
      t.status === 'pending'
        ? 'LGA Dispatch / Source Custodian'
        : t.status === 'dispatched' || t.status === 'in_transit'
          ? `${t.toFacility} Receiver`
          : t.status === 'delivered'
            ? 'Completed (Audit Log)'
            : 'LGA Supervisor';

    const safetyFloorEvidence =
      t.status === 'delivered'
        ? 'Safety floor (>=20 units) verified at release and receipt.'
        : 'Source safety floor (>=20 units) checked before authorization.';

    return {
      reference: t.reference,
      fromFacility: t.fromFacility,
      toFacility: t.toFacility,
      drug: t.drug,
      quantity: t.quantity,
      status: t.status,
      priority,
      attentionReason,
      nextOwner,
      safetyFloorEvidence,
    };
  });
}

export async function loadLgaDecisionData(): Promise<LgaDecisionBundle> {
  try {
    const [overview, failures] = await Promise.all([
      supplaiApi.lgaOverview(),
      supplaiApi.operationsFailures(),
    ]);
    return {
      source: 'live',
      overview,
      failures,
      queue: buildLgaDecisionQueue(overview.transfers, failures),
    };
  } catch {
    return {
      source: 'fixture',
      overview: FIXTURE_LGA_OVERVIEW,
      failures: FIXTURE_FAILURES,
      queue: buildLgaDecisionQueue(
        FIXTURE_LGA_OVERVIEW.transfers,
        FIXTURE_FAILURES,
      ),
    };
  }
}

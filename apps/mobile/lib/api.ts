export const API_BASE =
  (process.env.EXPO_PUBLIC_API_URL as string | undefined) ??
  'http://127.0.0.1:3000';

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
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    ...init,
  });
  const body = (await response.json()) as ApiErrorBody;
  if (!response.ok) {
    throw new SupplaiApiError(response.status, body);
  }
  return body;
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
};

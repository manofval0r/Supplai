import type {
  DeliveryResult,
  InboundSmsEvent,
  LgaOverview,
  OrderDetail,
  OperationalFailure,
  TransferSummary,
} from '@supplai/contracts';

import type {
  DispatchCandidate,
  OperationsRepository,
  OrderView,
  ReceiptRefusalOutcome,
  TransferEventOutcome,
} from '../operations/repository.js';
import type { ConfirmationResult, SmsRepository } from './repository.js';

interface RpcRequestRow {
  request_reference: string;
  match_id: string;
  facility_name: string;
  source_phone: string;
  quantity_offered: number;
  expires_at: string;
}

interface JsonRequestInit {
  method: 'GET' | 'POST';
  headers?: Record<string, string>;
  body: string;
}

export class SupabaseSmsRepository
  implements SmsRepository, OperationsRepository
{
  constructor(
    private readonly url: string,
    private readonly secretKey: string,
  ) {}

  async recordInbound(event: InboundSmsEvent) {
    const response = await fetch(`${this.url}/rest/v1/message_log`, {
      method: 'POST',
      headers: this.headers({ Prefer: 'return=minimal' }),
      body: JSON.stringify({
        direction: 'inbound',
        phone: event.from,
        body: event.body,
        provider: event.provider,
        provider_id: event.providerMessageId,
        received_at: event.receivedAt,
        processed_at: event.receivedAt,
      }),
    });
    if (response.status === 409) return 'duplicate' as const;
    if (!response.ok)
      throw new Error(
        `Supabase request failed (${response.status}): ${await response.text()}`,
      );
    return 'created' as const;
  }

  async recordOutbound(phone: string, body: string) {
    await this.request('/rest/v1/message_log', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({
        direction: 'outbound',
        phone,
        body,
        provider: 'pending',
        sent_at: new Date().toISOString(),
      }),
    });
  }

  async createRequest(input: {
    phone: string;
    medicine: string;
    quantity: number;
    rawText: string;
    now: Date;
  }) {
    const response = await this.request('/rest/v1/rpc/create_sms_request_v4', {
      method: 'POST',
      body: JSON.stringify({
        p_phone: input.phone,
        p_medicine: input.medicine,
        p_quantity: input.quantity,
        p_raw_text: input.rawText,
        p_now: input.now.toISOString(),
      }),
    });
    const [row] = (await response.json()) as RpcRequestRow[];
    return row
      ? {
          reference: row.request_reference,
          match: {
            id: row.match_id,
            facilityName: row.facility_name,
            sourcePhone: row.source_phone,
            quantity: row.quantity_offered,
            expiresAt: row.expires_at,
          },
        }
      : null;
  }

  async respondToOffer(input: {
    actorPhone: string;
    reference: string;
    accept: boolean;
    now: Date;
  }) {
    const response = await this.request('/rest/v1/rpc/respond_to_sms_offer', {
      method: 'POST',
      body: JSON.stringify({
        p_phone: input.actorPhone,
        p_reference: input.reference,
        p_accept: input.accept,
        p_now: input.now.toISOString(),
      }),
    });
    return (await response.json()) as ConfirmationResult;
  }

  async prepareDispatch(input: {
    requestReference: string;
    proofHash: string;
    proofExpiresAt: Date;
    now: Date;
  }) {
    const rows = await this.rpc<
      Array<{
        transfer_id: string;
        transfer_reference: string;
        pickup_facility_id: string;
        delivery_facility_id: string;
        transfer_quantity: number;
      }>
    >('prepare_dispatch_v1', {
      p_request_reference: input.requestReference,
      p_proof_hash: input.proofHash,
      p_proof_expires_at: input.proofExpiresAt.toISOString(),
      p_now: input.now.toISOString(),
    });
    const row = rows[0];
    return row
      ? ({
          transferId: row.transfer_id,
          transferReference: row.transfer_reference,
          pickupFacilityId: row.pickup_facility_id,
          deliveryFacilityId: row.delivery_facility_id,
          quantity: row.transfer_quantity,
        } satisfies DispatchCandidate)
      : null;
  }

  async markDispatched(input: {
    transferReference: string;
    externalDispatchId: string;
    now: Date;
  }) {
    await this.rpc<null>('mark_dispatched_v1', {
      p_transfer_reference: input.transferReference,
      p_external_dispatch_id: input.externalDispatchId,
      p_now: input.now.toISOString(),
    });
  }

  async verifyDelivery(input: {
    transferReference: string;
    proofHash: string;
    verifierPhone: string;
    now: Date;
  }): Promise<DeliveryResult> {
    const rows = await this.rpc<
      Array<{
        result_status: DeliveryResult['status'];
        attempts_remaining: number;
      }>
    >('verify_delivery_v2', {
      p_transfer_reference: input.transferReference,
      p_proof_hash: input.proofHash,
      p_verifier_phone: input.verifierPhone,
      p_now: input.now.toISOString(),
    });
    const row = rows[0] ?? {
      result_status: 'not_found' as const,
      attempts_remaining: 0,
    };
    return {
      status: row.result_status,
      attemptsRemaining: row.attempts_remaining,
    };
  }

  async recordTransferEvent(input: {
    transferReference: string;
    eventType: 'picked_up' | 'in_transit';
    actorRole: 'rider' | 'system';
    detail: string;
    now: Date;
  }): Promise<TransferEventOutcome> {
    const rows = await this.rpc<Array<{ result_status: TransferEventOutcome }>>(
      'record_transfer_event_v1',
      {
        p_transfer_reference: input.transferReference,
        p_event_type: input.eventType,
        p_actor_role: input.actorRole,
        p_detail: input.detail,
        p_now: input.now.toISOString(),
      },
    );
    return rows[0]?.result_status ?? 'not_found';
  }

  async refuseReceipt(input: {
    transferReference: string;
    actorPhone: string;
    reason: string;
    now: Date;
  }): Promise<ReceiptRefusalOutcome> {
    const rows = await this.rpc<
      Array<{ result_status: ReceiptRefusalOutcome }>
    >('refuse_receipt_v1', {
      p_transfer_reference: input.transferReference,
      p_actor_phone: input.actorPhone,
      p_reason: input.reason,
      p_now: input.now.toISOString(),
    });
    return rows[0]?.result_status ?? 'not_found';
  }

  async getTransfer(reference: string): Promise<TransferSummary | null> {
    const response = await this.request(
      `/rest/v1/transfer?reference=eq.${encodeURIComponent(reference)}&select=id,reference,quantity,status,created_at,dispatched_at,delivered_at,from_facility_id,to_facility_id,drug:drug(canonical_name),from:facility!transfer_from_facility_id_fkey(name),to:facility!transfer_to_facility_id_fkey(name),request:request!transfer_request_id_fkey(reference)&limit=1`,
      { method: 'GET', body: '' },
    );
    const rows = (await response.json()) as Array<{
      id: string;
      reference: string;
      quantity: number;
      status: TransferSummary['status'];
      created_at: string;
      dispatched_at: string | null;
      delivered_at: string | null;
      from_facility_id: string;
      to_facility_id: string;
      drug: { canonical_name: string };
      from: { name: string };
      to: { name: string };
      request: { reference: string };
    }>;
    const row = rows[0];
    return row
      ? {
          id: row.id,
          reference: row.reference,
          fromFacility: row.from.name,
          toFacility: row.to.name,
          fromFacilityId: row.from_facility_id,
          toFacilityId: row.to_facility_id,
          requestReference: row.request.reference,
          drug: row.drug.canonical_name,
          quantity: row.quantity,
          status: row.status,
          createdAt: row.created_at,
          ...(row.dispatched_at ? { dispatchedAt: row.dispatched_at } : {}),
          ...(row.delivered_at ? { deliveredAt: row.delivered_at } : {}),
        }
      : null;
  }

  async getOrderDetail(reference: string): Promise<OrderDetail | null> {
    const requestResponse = await this.request(
      `/rest/v1/request?reference=eq.${encodeURIComponent(reference)}&select=reference,quantity,created_at,drug:drug(id,canonical_name),requester:facility!request_facility_id_fkey(id,name),matches:match(quantity_offered,status,confirmed_at,offered_at,confirmation_expires_at,source:facility!match_facility_id_fkey(id,name,phone_primary))&limit=1`,
      { method: 'GET', body: '' },
    );
    const requestRows = (await requestResponse.json()) as Array<{
      reference: string;
      quantity: number;
      created_at: string;
      drug: { id: string; canonical_name: string };
      requester: { id: string; name: string };
      matches: Array<{
        quantity_offered: number;
        status: 'offered' | 'reserved' | 'consumed' | 'declined' | 'expired';
        confirmed_at: string | null;
        offered_at: string;
        confirmation_expires_at: string | null;
        source: { id: string; name: string; phone_primary: string };
      }>;
    }>;
    const requestRow = requestRows[0];
    if (!requestRow) return null;
    const match = requestRow.matches[0];
    if (!match) return null;

    const transferResponse = await this.request(
      `/rest/v1/transfer?request.reference=eq.${encodeURIComponent(reference)}&select=id,reference,status,created_at,dispatched_at,delivered_at,rider:rider!transfer_rider_id_fkey(display_name)&limit=1`,
      { method: 'GET', body: '' },
    );
    const transfers = (await transferResponse.json()) as Array<{
      id: string;
      reference: string;
      status: TransferSummary['status'];
      created_at: string;
      dispatched_at: string | null;
      delivered_at: string | null;
      rider: { display_name: string } | null;
    }>;
    const transfer = transfers[0] ?? null;

    let events: Array<{
      sequence: number;
      event_type: string;
      actor_role: string;
      detail: string;
      occurred_at: string;
    }> = [];
    if (transfer) {
      const eventResponse = await this.request(
        `/rest/v1/transfer_event?transfer_id=eq.${transfer.id}&select=sequence,event_type,actor_role,detail,occurred_at&order=sequence.asc`,
        { method: 'GET', body: '' },
      );
      events = (await eventResponse.json()) as typeof events;
    }

    const lotResponse = await this.request(
      `/rest/v1/stock_lot?facility_id=eq.${match.source.id}&drug_id=eq.${requestRow.drug.id}&condition=eq.usable&ambient_only=is.true&order=expires_on.asc&limit=1&select=batch_number,expires_on,quantity`,
      { method: 'GET', body: '' },
    );
    const lots = (await lotResponse.json()) as Array<{
      batch_number: string;
      expires_on: string;
      quantity: number;
    }>;
    const lot = lots[0] ?? null;

    const commodity = requestRow.drug.canonical_name
      .toLowerCase()
      .includes('zinc')
      ? 'zinc'
      : 'ors';
    const delivered = transfer?.status === 'delivered';
    const failed = transfer?.status === 'failed';
    const inTransit = transfer?.status === 'in_transit';
    const dispatched = transfer?.status === 'dispatched' || inTransit;
    const awaitingDispatch =
      match.status === 'reserved' || transfer?.status === 'pending';

    const timeline: OrderDetail['timeline'] = [
      {
        sequence: 1,
        type: 'request_created',
        occurredAt: requestRow.created_at,
        actorRole: 'facility_requester',
        label: 'Stock request created',
      },
      {
        sequence: 2,
        type: 'source_confirmation_requested',
        occurredAt: match.offered_at,
        actorRole: 'system',
        label: 'Source confirmation requested',
      },
    ];
    if (match.status === 'reserved' || match.status === 'consumed' || transfer)
      timeline.push({
        sequence: timeline.length + 1,
        type: 'source_released',
        occurredAt: match.confirmed_at ?? match.offered_at,
        actorRole: 'source_custodian',
        label: 'Source stock released for transfer',
      });
    if (transfer)
      timeline.push({
        sequence: timeline.length + 1,
        type: 'rider_assigned',
        occurredAt: transfer.dispatched_at ?? transfer.created_at,
        actorRole: 'system',
        label: 'Rider assigned',
      });
    for (const event of events) {
      const canonicalType =
        event.event_type === 'exception_raised'
          ? ('escalated' as const)
          : event.event_type === 'picked_up' ||
              event.event_type === 'in_transit'
            ? event.event_type
            : null;
      if (!canonicalType) continue;
      timeline.push({
        sequence: timeline.length + 1,
        type: canonicalType,
        occurredAt: event.occurred_at,
        actorRole:
          event.actor_role === 'receiving_facility'
            ? 'facility_requester'
            : event.actor_role === 'rider'
              ? 'rider'
              : 'system',
        label: event.detail,
      });
    }
    if (delivered)
      timeline.push({
        sequence: timeline.length + 1,
        type: 'received',
        occurredAt: transfer.delivered_at ?? transfer.created_at,
        actorRole: 'facility_requester',
        label: 'Receiving facility accepted handover',
      });

    return {
      reference: requestRow.reference,
      status: delivered
        ? 'received'
        : failed
          ? 'escalated'
          : dispatched
            ? 'rider_en_route'
            : awaitingDispatch
              ? 'awaiting_dispatch'
              : 'awaiting_source_confirmation',
      commodity,
      quantity: requestRow.quantity,
      sourceFacility: match.source.name,
      requestingFacility: requestRow.requester.name,
      sourceFacilityId: match.source.id,
      requestingFacilityId: requestRow.requester.id,
      transferReference: transfer?.reference ?? null,
      evidence: {
        commodity,
        batchNumber: lot?.batch_number ?? 'Awaiting batch scan',
        expiresOn: lot?.expires_on ?? '2099-12-31',
        inspectedAt: requestRow.created_at,
        condition: 'usable',
        ambientOnly: true,
        quantityOnHand: Math.max(
          lot?.quantity ?? match.quantity_offered,
          requestRow.quantity,
        ),
        safetyFloor: 0,
        quantityRequested: requestRow.quantity,
      },
      timeline,
      allowedActions: delivered
        ? []
        : failed
          ? ['Review exception']
          : match.status === 'offered'
            ? ['confirm_release', 'decline_release']
            : inTransit
              ? ['receive', 'refuse_receipt']
              : dispatched
                ? ['mark_picked_up', 'mark_in_transit']
                : ['dispatch'],
      nextAccountableOwner: delivered
        ? 'none'
        : failed
          ? 'lga'
          : dispatched
            ? inTransit
              ? 'receiving_facility'
              : 'rider'
            : awaitingDispatch
              ? 'lga'
              : 'source_custodian',
    };
  }

  async listOrders(view: OrderView): Promise<OrderDetail[]> {
    const references = new Set<string>();
    if (view.role === 'facility') {
      if (!view.facilityId) return [];
      const raised = await this.request(
        `/rest/v1/request?facility_id=eq.${encodeURIComponent(view.facilityId)}&select=reference&order=created_at.desc&limit=50`,
        { method: 'GET', body: '' },
      );
      for (const row of (await raised.json()) as Array<{ reference: string }>)
        references.add(row.reference);
      const offered = await this.request(
        `/rest/v1/match?facility_id=eq.${encodeURIComponent(view.facilityId)}&select=request:request!match_request_id_fkey(reference)&limit=50`,
        { method: 'GET', body: '' },
      );
      for (const row of (await offered.json()) as Array<{
        request: { reference: string } | null;
      }>) {
        if (row.request) references.add(row.request.reference);
      }
    } else {
      const dispatched = await this.request(
        '/rest/v1/transfer?select=request:request!transfer_request_id_fkey(reference)&order=created_at.desc&limit=50',
        { method: 'GET', body: '' },
      );
      for (const row of (await dispatched.json()) as Array<{
        request: { reference: string } | null;
      }>) {
        if (row.request) references.add(row.request.reference);
      }
    }
    const orders = await Promise.all(
      [...references].map((reference) => this.getOrderDetail(reference)),
    );
    return orders.filter((order): order is OrderDetail => order !== null);
  }

  async getOverview(now: Date): Promise<LgaOverview> {
    const response = await this.request(
      '/rest/v1/transfer?select=reference&limit=200',
      { method: 'GET', body: '' },
    );
    const refs = (await response.json()) as Array<{ reference: string }>;
    const transfers = (
      await Promise.all(
        refs.map(({ reference }) => this.getTransfer(reference)),
      )
    ).filter((item): item is TransferSummary => item !== null);
    return {
      lgaCode: 'DEMO-LGA',
      generatedAt: now.toISOString(),
      metrics: {
        openStockouts: 0,
        transfersInFlight: transfers.filter(
          (t) => t.status === 'dispatched' || t.status === 'in_transit',
        ).length,
        completedTransfers: transfers.filter((t) => t.status === 'delivered')
          .length,
        unmetRequests: 0,
        responseRate:
          transfers.length === 0
            ? 0
            : transfers.filter((t) => t.status === 'delivered').length /
              transfers.length,
      },
      transfers,
    };
  }

  async getFailures(now: Date): Promise<OperationalFailure[]> {
    const response = await this.request(
      '/rest/v1/transfer?status=in.(failed,locked)&select=id,reference,status',
      { method: 'GET', body: '' },
    );
    const rows = (await response.json()) as Array<{
      id: string;
      reference: string;
      status: 'failed' | 'locked';
    }>;
    return rows.map((row) => ({
      id: row.id,
      category: row.status === 'locked' ? 'proof_locked' : 'dispatch',
      reference: row.reference,
      occurredAt: now.toISOString(),
      detail:
        row.status === 'locked'
          ? 'Delivery proof locked after invalid attempts.'
          : 'Dispatch failed.',
    }));
  }

  private async rpc<T>(
    name: string,
    payload: Record<string, unknown>,
  ): Promise<T> {
    const response = await this.request(`/rest/v1/rpc/${name}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return (await response.json()) as T;
  }

  private async request(path: string, init: JsonRequestInit) {
    const response = await fetch(`${this.url}${path}`, {
      ...init,
      headers: this.headers(init.headers),
    });
    if (!response.ok)
      throw new Error(
        `Supabase request failed (${response.status}): ${await response.text()}`,
      );
    return response;
  }

  private headers(
    additional: Record<string, string> = {},
  ): Record<string, string> {
    return {
      apikey: this.secretKey,
      Authorization: `Bearer ${this.secretKey}`,
      'Content-Type': 'application/json',
      ...additional,
    };
  }
}

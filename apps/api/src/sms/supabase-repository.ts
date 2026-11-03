import type {
  DeliveryResult,
  InboundSmsEvent,
  LgaOverview,
  OperationalFailure,
  TransferSummary,
} from '@supplai/contracts';

import type {
  DispatchCandidate,
  OperationsRepository,
} from '../operations/repository.js';
import type { ConfirmationResult, SmsRepository } from './repository.js';

interface RpcRequestRow {
  request_reference: string;
  match_id: string;
  facility_name: string;
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
    const response = await this.request('/rest/v1/rpc/create_sms_request_v2', {
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
            quantity: row.quantity_offered,
            expiresAt: row.expires_at,
          },
        }
      : null;
  }

  async respondToOffer(input: {
    phone: string;
    reference: string;
    accept: boolean;
    now: Date;
  }) {
    const response = await this.request('/rest/v1/rpc/respond_to_sms_offer', {
      method: 'POST',
      body: JSON.stringify({
        p_phone: input.phone,
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

  async getTransfer(reference: string): Promise<TransferSummary | null> {
    const response = await this.request(
      `/rest/v1/transfer?reference=eq.${encodeURIComponent(reference)}&select=id,reference,quantity,status,created_at,drug:drug(canonical_name),from:facility!transfer_from_facility_id_fkey(name),to:facility!transfer_to_facility_id_fkey(name)`,
      { method: 'GET', body: '' },
    );
    const rows = (await response.json()) as Array<{
      id: string;
      reference: string;
      quantity: number;
      status: TransferSummary['status'];
      created_at: string;
      drug: { canonical_name: string };
      from: { name: string };
      to: { name: string };
    }>;
    const row = rows[0];
    return row
      ? {
          id: row.id,
          reference: row.reference,
          fromFacility: row.from.name,
          toFacility: row.to.name,
          drug: row.drug.canonical_name,
          quantity: row.quantity,
          status: row.status,
          createdAt: row.created_at,
        }
      : null;
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

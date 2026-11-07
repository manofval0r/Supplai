import { randomUUID } from 'node:crypto';

import type {
  DeliveryResult,
  InboundSmsEvent,
  LgaOverview,
  OrderDetail,
  OperationalFailure,
  TransferSummary,
} from '@supplai/contracts';

import { proofHashesEqual } from '../operations/proof.js';
import type {
  DispatchCandidate,
  OperationsRepository,
  OrderView,
  ReceiptRefusalOutcome,
  TransferEventOutcome,
} from '../operations/repository.js';

import { normalizeMedicineTerm } from './parser.js';
import type {
  ConfirmationResult,
  SmsRepository,
  SupplyMatch,
} from './repository.js';

interface FacilityStock {
  id: string;
  name: string;
  phone: string;
  stock: Record<'ors' | 'zinc', number>;
  safetyFloor: Record<'ors' | 'zinc', number>;
}

interface Offer {
  sourcePhone: string;
  reference: string;
  match: SupplyMatch;
  state: 'offered' | 'confirmed' | 'declined';
  respondedAt?: Date;
  requesterId: string;
  supplierId: string;
  drug: 'ors' | 'zinc';
  quantity: number;
}

interface MemoryTransfer {
  id: string;
  reference: string;
  requestReference: string;
  fromFacilityId: string;
  toFacilityId: string;
  drug: 'ors' | 'zinc';
  quantity: number;
  proofHash: string;
  proofExpiresAt: Date;
  proofAttempts: number;
  status:
    'pending' | 'dispatched' | 'in_transit' | 'delivered' | 'failed' | 'locked';
  externalDispatchId?: string;
  dispatchedAt?: Date;
  deliveredAt?: Date;
  createdAt: Date;
  events: Array<{
    sequence: number;
    eventType: 'picked_up' | 'in_transit' | 'exception_raised';
    actorRole: 'rider' | 'system' | 'receiving_facility';
    detail: string;
    occurredAt: Date;
  }>;
}

const aliases = new Map<string, 'ors' | 'zinc'>([
  ['ors', 'ors'],
  ['oral rehydration salts', 'ors'],
  ['oral rehydration salt', 'ors'],
  ['oral salt', 'ors'],
  ['rehydration sachet', 'ors'],
  ['rehidration salt', 'ors'],
  ['zinc', 'zinc'],
  ['zinc 20', 'zinc'],
  ['zinc 20mg', 'zinc'],
  ['zinc tablet', 'zinc'],
  ['zinc dispersible', 'zinc'],
]);

function createDemoFacilities(): FacilityStock[] {
  return Array.from({ length: 8 }, (_, index) => ({
    id: `PHC-${String.fromCharCode(65 + index)}`,
    name:
      index === 0
        ? 'Aiyetoro Central PHC'
        : `Demo PHC ${String.fromCharCode(65 + index)}`,
    phone: `+234801000000${index + 1}`,
    stock: {
      ors: index === 0 ? 0 : index === 1 ? 80 : index === 2 ? 35 : 15,
      zinc: index === 0 ? 4 : index === 1 ? 60 : 20,
    },
    safetyFloor: {
      ors: index === 0 ? 0 : 20,
      zinc: index === 0 ? 0 : 10,
    },
  }));
}

export class InMemorySmsRepository
  implements SmsRepository, OperationsRepository
{
  private readonly messageIds = new Set<string>();
  private readonly offers = new Map<string, Offer>();
  private sequence = 1;
  private readonly transfers = new Map<string, MemoryTransfer>();
  private readonly movements: Array<{
    transferReference: string;
    facilityId: string;
    delta: number;
  }> = [];
  readonly outbound: Array<{
    phone: string;
    body: string;
    requestReference?: string;
  }> = [];

  private facilities: FacilityStock[];

  constructor(facilities?: FacilityStock[]) {
    this.facilities = facilities
      ? facilities.map((f) => ({
          ...f,
          stock: { ...f.stock },
          safetyFloor: { ...f.safetyFloor },
        }))
      : createDemoFacilities();
  }

  reset(): void {
    this.messageIds.clear();
    this.offers.clear();
    this.transfers.clear();
    this.movements.length = 0;
    this.outbound.length = 0;
    this.sequence = 1;
    this.facilities = createDemoFacilities();
  }

  recordInbound(event: InboundSmsEvent) {
    const key = `${event.provider}:${event.providerMessageId}`;
    if (this.messageIds.has(key)) return Promise.resolve('duplicate' as const);
    this.messageIds.add(key);
    return Promise.resolve('created' as const);
  }

  recordOutbound(phone: string, body: string, requestReference?: string) {
    this.outbound.push({
      phone,
      body,
      ...(requestReference ? { requestReference } : {}),
    });
    return Promise.resolve();
  }

  createRequest(input: {
    phone: string;
    medicine: string;
    quantity: number;
    now: Date;
  }) {
    const drug = aliases.get(normalizeMedicineTerm(input.medicine));
    const requester = this.facilities.find(
      (facility) => facility.phone === input.phone,
    );
    if (!drug || !requester) return Promise.resolve(null);

    const supplier = this.facilities
      .filter(
        (facility) =>
          facility.id !== requester.id &&
          facility.stock[drug] - input.quantity >= facility.safetyFloor[drug],
      )
      .sort(
        (left, right) =>
          right.stock[drug] - left.stock[drug] ||
          left.id.localeCompare(right.id),
      )[0];
    if (!supplier) return Promise.resolve(null);

    const reference = `REQ-${String(this.sequence++).padStart(4, '0')}`;
    const match: SupplyMatch = {
      id: `MATCH-${reference}`,
      facilityName: supplier.name,
      sourcePhone: supplier.phone,
      quantity: input.quantity,
      expiresAt: new Date(input.now.getTime() + 10 * 60_000).toISOString(),
    };
    this.offers.set(reference, {
      sourcePhone: supplier.phone,
      reference,
      match,
      state: 'offered',
      requesterId: requester.id,
      supplierId: supplier.id,
      drug,
      quantity: input.quantity,
    });
    return Promise.resolve({ reference, match });
  }

  respondToOffer(input: {
    actorPhone: string;
    reference: string;
    accept: boolean;
    now: Date;
  }): Promise<ConfirmationResult> {
    const offer = this.offers.get(input.reference);
    if (!offer || offer.sourcePhone !== input.actorPhone)
      return Promise.resolve('not_found');
    if (offer.state !== 'offered') return Promise.resolve('already_closed');
    if (input.now >= new Date(offer.match.expiresAt))
      return Promise.resolve('expired');
    offer.state = input.accept ? 'confirmed' : 'declined';
    offer.respondedAt = input.now;
    return Promise.resolve(offer.state);
  }

  prepareDispatch(input: {
    requestReference: string;
    proofHash: string;
    proofExpiresAt: Date;
    now: Date;
  }): Promise<DispatchCandidate | null> {
    const offer = this.offers.get(input.requestReference);
    if (!offer || offer.state !== 'confirmed') return Promise.resolve(null);
    const existing = [...this.transfers.values()].find(
      (item) => item.requestReference === input.requestReference,
    );
    if (existing) return Promise.resolve(null);
    const reference = `TRF-${String(this.transfers.size + 1).padStart(4, '0')}`;
    const transfer: MemoryTransfer = {
      id: randomUUID(),
      reference,
      requestReference: input.requestReference,
      fromFacilityId: offer.supplierId,
      toFacilityId: offer.requesterId,
      drug: offer.drug,
      quantity: offer.quantity,
      proofHash: input.proofHash,
      proofExpiresAt: input.proofExpiresAt,
      proofAttempts: 0,
      status: 'pending',
      createdAt: input.now,
      events: [],
    };
    this.transfers.set(reference, transfer);
    return Promise.resolve({
      transferId: transfer.id,
      transferReference: reference,
      pickupFacilityId: transfer.fromFacilityId,
      deliveryFacilityId: transfer.toFacilityId,
      quantity: transfer.quantity,
    });
  }

  markDispatched(input: {
    transferReference: string;
    externalDispatchId: string;
    now?: Date;
  }): Promise<void> {
    const transfer = this.transfers.get(input.transferReference);
    if (!transfer) throw new Error('Transfer not found');
    transfer.externalDispatchId = input.externalDispatchId;
    transfer.status = 'dispatched';
    transfer.dispatchedAt = input.now ?? new Date();
    return Promise.resolve();
  }

  recordTransferEvent(input: {
    transferReference: string;
    eventType: 'picked_up' | 'in_transit';
    actorRole: 'rider' | 'system';
    detail: string;
    now: Date;
  }): Promise<TransferEventOutcome> {
    const transfer = this.transfers.get(input.transferReference);
    if (!transfer) return Promise.resolve('not_found');
    if (transfer.status !== 'dispatched' && transfer.status !== 'in_transit')
      return Promise.resolve('already_closed');
    transfer.events.push({
      sequence: transfer.events.length + 1,
      eventType: input.eventType,
      actorRole: input.actorRole,
      detail: input.detail,
      occurredAt: input.now,
    });
    if (input.eventType === 'in_transit' && transfer.status === 'dispatched')
      transfer.status = 'in_transit';
    return Promise.resolve('recorded');
  }

  refuseReceipt(input: {
    transferReference: string;
    actorPhone: string;
    reason: string;
    now: Date;
  }): Promise<ReceiptRefusalOutcome> {
    const transfer = this.transfers.get(input.transferReference);
    if (!transfer) return Promise.resolve('not_found');
    const receiver = this.facilities.find(
      (facility) => facility.id === transfer.toFacilityId,
    );
    if (!receiver || receiver.phone !== input.actorPhone)
      return Promise.resolve('unauthorized');
    if (transfer.status !== 'dispatched' && transfer.status !== 'in_transit')
      return Promise.resolve('already_closed');
    transfer.status = 'failed';
    transfer.events.push({
      sequence: transfer.events.length + 1,
      eventType: 'exception_raised',
      actorRole: 'receiving_facility',
      detail: input.reason,
      occurredAt: input.now,
    });
    return Promise.resolve('refused');
  }

  verifyDelivery(input: {
    transferReference: string;
    proofHash: string;
    verifierPhone: string;
    now: Date;
  }): Promise<DeliveryResult> {
    const transfer = this.transfers.get(input.transferReference);
    if (!transfer)
      return Promise.resolve({ status: 'not_found', attemptsRemaining: 0 });
    if (transfer.status === 'delivered' || transfer.status === 'locked')
      return Promise.resolve({
        status: transfer.status === 'locked' ? 'locked' : 'already_closed',
        attemptsRemaining: Math.max(0, 2 - transfer.proofAttempts),
      });
    const receiver = this.facilities.find(
      (facility) => facility.id === transfer.toFacilityId,
    )!;
    if (input.verifierPhone !== receiver.phone)
      return Promise.resolve({
        status: 'unauthorized',
        attemptsRemaining: 2 - transfer.proofAttempts,
      });
    if (input.now >= transfer.proofExpiresAt)
      return Promise.resolve({
        status: 'expired',
        attemptsRemaining: 2 - transfer.proofAttempts,
      });
    if (!proofHashesEqual(transfer.proofHash, input.proofHash)) {
      transfer.proofAttempts += 1;
      if (transfer.proofAttempts >= 2) transfer.status = 'locked';
      return Promise.resolve({
        status: transfer.status === 'locked' ? 'locked' : 'invalid_proof',
        attemptsRemaining: Math.max(0, 2 - transfer.proofAttempts),
      });
    }
    const supplier = this.facilities.find(
      (facility) => facility.id === transfer.fromFacilityId,
    )!;
    if (
      supplier.stock[transfer.drug] - transfer.quantity <
      supplier.safetyFloor[transfer.drug]
    )
      throw new Error('Transfer would breach the source safety floor');
    supplier.stock[transfer.drug] -= transfer.quantity;
    receiver.stock[transfer.drug] += transfer.quantity;
    this.movements.push(
      {
        transferReference: transfer.reference,
        facilityId: supplier.id,
        delta: -transfer.quantity,
      },
      {
        transferReference: transfer.reference,
        facilityId: receiver.id,
        delta: transfer.quantity,
      },
    );
    transfer.status = 'delivered';
    transfer.deliveredAt = input.now;
    return Promise.resolve({
      status: 'delivered',
      attemptsRemaining: 2 - transfer.proofAttempts,
    });
  }

  getTransfer(reference: string): Promise<TransferSummary | null> {
    const transfer = this.transfers.get(reference);
    if (!transfer) return Promise.resolve(null);
    return Promise.resolve({
      id: transfer.id,
      reference,
      fromFacility: this.facilities.find(
        (f) => f.id === transfer.fromFacilityId,
      )!.name,
      toFacility: this.facilities.find((f) => f.id === transfer.toFacilityId)!
        .name,
      fromFacilityId: transfer.fromFacilityId,
      toFacilityId: transfer.toFacilityId,
      requestReference: transfer.requestReference,
      drug: transfer.drug === 'ors' ? 'Oral Rehydration Salts' : 'Zinc Sulfate',
      quantity: transfer.quantity,
      status: transfer.status,
      createdAt: transfer.createdAt.toISOString(),
      ...(transfer.dispatchedAt
        ? { dispatchedAt: transfer.dispatchedAt.toISOString() }
        : {}),
      ...(transfer.deliveredAt
        ? { deliveredAt: transfer.deliveredAt.toISOString() }
        : {}),
    });
  }

  getOrderDetail(reference: string): Promise<OrderDetail | null> {
    const offer = this.offers.get(reference);
    if (!offer) return Promise.resolve(null);
    const transfer = [...this.transfers.values()].find(
      (item) => item.requestReference === reference,
    );
    const source = this.facilities.find(
      (item) => item.id === offer.supplierId,
    )!;
    const requester = this.facilities.find(
      (item) => item.id === offer.requesterId,
    )!;
    const createdAt = transfer?.createdAt ?? new Date(offer.match.expiresAt);
    const releasedAt = offer.respondedAt ?? createdAt;
    const timeline: OrderDetail['timeline'] = [
      {
        sequence: 1,
        type: 'request_created',
        occurredAt: createdAt.toISOString(),
        actorRole: 'facility_requester',
        label: 'Stock request created',
      },
      {
        sequence: 2,
        type: 'source_confirmation_requested',
        occurredAt: createdAt.toISOString(),
        actorRole: 'system',
        label: 'Source confirmation requested',
      },
    ];
    if (offer.state === 'confirmed')
      timeline.push({
        sequence: timeline.length + 1,
        type: 'source_released',
        occurredAt: releasedAt.toISOString(),
        actorRole: 'source_custodian',
        label: 'Source stock released for transfer',
      });
    if (transfer)
      timeline.push({
        sequence: timeline.length + 1,
        type: 'rider_assigned',
        occurredAt: (transfer.dispatchedAt ?? transfer.createdAt).toISOString(),
        actorRole: 'system',
        label: 'Rider assigned',
      });
    for (const event of transfer?.events ?? []) {
      timeline.push({
        sequence: timeline.length + 1,
        type:
          event.eventType === 'exception_raised'
            ? 'escalated'
            : event.eventType,
        occurredAt: event.occurredAt.toISOString(),
        actorRole:
          event.actorRole === 'receiving_facility'
            ? 'facility_requester'
            : event.actorRole,
        label:
          event.eventType === 'picked_up'
            ? 'Rider collected the medicine'
            : event.eventType === 'in_transit'
              ? 'Transfer in transit'
              : event.detail,
      });
    }
    if (transfer?.status === 'delivered')
      timeline.push({
        sequence: timeline.length + 1,
        type: 'received',
        occurredAt: (transfer.deliveredAt ?? createdAt).toISOString(),
        actorRole: 'facility_requester',
        label: 'Receiving facility accepted handover',
      });

    const delivered = transfer?.status === 'delivered';
    const failed = transfer?.status === 'failed';
    const inTransit = transfer?.status === 'in_transit';
    const dispatched = transfer?.status === 'dispatched' || inTransit;
    const awaitingDispatch =
      offer.state === 'confirmed' &&
      (!transfer || transfer.status === 'pending');

    return Promise.resolve({
      reference,
      status: delivered
        ? 'received'
        : failed
          ? 'escalated'
          : dispatched
            ? 'rider_en_route'
            : awaitingDispatch
              ? 'awaiting_dispatch'
              : 'awaiting_source_confirmation',
      commodity: offer.drug,
      quantity: offer.quantity,
      sourceFacility: source.name,
      requestingFacility: requester.name,
      sourceFacilityId: source.id,
      requestingFacilityId: requester.id,
      transferReference: transfer?.reference ?? null,
      evidence: {
        commodity: offer.drug,
        batchNumber: `${offer.drug.toUpperCase()}-DEMO-01`,
        expiresOn: '2027-06-30',
        inspectedAt: createdAt.toISOString(),
        condition: 'usable',
        ambientOnly: true,
        quantityOnHand:
          source.stock[offer.drug] + (delivered ? offer.quantity : 0),
        safetyFloor: source.safetyFloor[offer.drug],
        quantityRequested: offer.quantity,
      },
      timeline,
      allowedActions: delivered
        ? []
        : failed
          ? ['Review exception']
          : offer.state === 'offered'
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
    });
  }

  async listOrders(view: OrderView): Promise<OrderDetail[]> {
    const offered = [...this.offers.values()].filter((offer) => {
      if (view.role === 'lga') return true;
      if (view.role === 'facility') {
        return (
          offer.requesterId === view.facilityId ||
          offer.supplierId === view.facilityId
        );
      }
      return [...this.transfers.values()].some(
        (transfer) =>
          transfer.requestReference === offer.reference &&
          (!view.riderName || transfer.status !== 'pending'),
      );
    });
    const orders = await Promise.all(
      offered.map((offer) => this.getOrderDetail(offer.reference)),
    );
    return orders.filter((order): order is OrderDetail => order !== null);
  }

  async getOverview(now: Date): Promise<LgaOverview> {
    const transfers = (
      await Promise.all(
        [...this.transfers.keys()].map((reference) =>
          this.getTransfer(reference),
        ),
      )
    ).filter((item): item is TransferSummary => item !== null);
    return {
      lgaCode: 'DEMO-LGA',
      generatedAt: now.toISOString(),
      metrics: {
        openStockouts: this.facilities.filter(
          (f) => f.stock.ors === 0 || f.stock.zinc === 0,
        ).length,
        transfersInFlight: transfers.filter(
          (t) => t.status === 'dispatched' || t.status === 'in_transit',
        ).length,
        completedTransfers: transfers.filter((t) => t.status === 'delivered')
          .length,
        unmetRequests: 0,
        responseRate:
          this.offers.size === 0
            ? 0
            : [...this.offers.values()].filter((o) => o.state === 'confirmed')
                .length / this.offers.size,
      },
      transfers,
    };
  }

  getFailures(now: Date): Promise<OperationalFailure[]> {
    const failures: OperationalFailure[] = [];
    for (const transfer of this.transfers.values()) {
      if (transfer.status === 'locked') {
        failures.push({
          id: transfer.id,
          category: 'proof_locked',
          reference: transfer.reference,
          occurredAt: now.toISOString(),
          detail: 'Delivery proof locked after two invalid attempts.',
        });
      } else if (transfer.status === 'failed') {
        failures.push({
          id: transfer.id,
          category: 'dispatch',
          reference: transfer.reference,
          occurredAt: now.toISOString(),
          detail:
            'Receipt refused by the receiving facility; escalated to LGA.',
        });
      }
    }
    return Promise.resolve(failures);
  }

  getMovementCount(): number {
    return this.movements.length;
  }

  getStock(facilityId: string, drug: 'ors' | 'zinc'): number {
    const facility = this.facilities.find((item) => item.id === facilityId);
    if (!facility) throw new Error('Facility not found');
    return facility.stock[drug];
  }
}

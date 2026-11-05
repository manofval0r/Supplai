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
  status: 'pending' | 'dispatched' | 'delivered' | 'locked';
  externalDispatchId?: string;
  createdAt: Date;
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

const demoFacilities: FacilityStock[] = Array.from(
  { length: 8 },
  (_, index) => ({
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
  }),
);

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

  constructor(private readonly facilities = demoFacilities) {}

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
  }): Promise<void> {
    const transfer = this.transfers.get(input.transferReference);
    if (!transfer) throw new Error('Transfer not found');
    transfer.externalDispatchId = input.externalDispatchId;
    transfer.status = 'dispatched';
    return Promise.resolve();
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
      drug: transfer.drug === 'ors' ? 'Oral Rehydration Salts' : 'Zinc Sulfate',
      quantity: transfer.quantity,
      status: transfer.status,
      createdAt: transfer.createdAt.toISOString(),
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
    const at = transfer?.createdAt ?? new Date(offer.match.expiresAt);
    const timeline: OrderDetail['timeline'] = [
      {
        sequence: 1,
        type: 'request_created',
        occurredAt: at.toISOString(),
        actorRole: 'facility_requester',
        label: 'Stock request created',
      },
      {
        sequence: 2,
        type: 'source_confirmation_requested',
        occurredAt: at.toISOString(),
        actorRole: 'system',
        label: 'Source confirmation requested',
      },
    ];
    if (offer.state === 'confirmed')
      timeline.push({
        sequence: 3,
        type: 'source_released',
        occurredAt: at.toISOString(),
        actorRole: 'source_custodian',
        label: 'Source stock released for transfer',
      });
    if (transfer)
      timeline.push({
        sequence: timeline.length + 1,
        type: 'rider_assigned',
        occurredAt: at.toISOString(),
        actorRole: 'system',
        label: 'Rider assigned',
      });
    if (transfer?.status === 'delivered')
      timeline.push({
        sequence: timeline.length + 1,
        type: 'received',
        occurredAt: at.toISOString(),
        actorRole: 'facility_requester',
        label: 'Receiving facility accepted handover',
      });
    const delivered = transfer?.status === 'delivered';
    const dispatched = transfer?.status === 'dispatched';
    return Promise.resolve({
      reference,
      status: delivered
        ? 'received'
        : dispatched
          ? 'rider_en_route'
          : 'awaiting_source_confirmation',
      commodity: offer.drug,
      quantity: offer.quantity,
      sourceFacility: source.name,
      requestingFacility: requester.name,
      evidence: {
        commodity: offer.drug,
        batchNumber: `${offer.drug.toUpperCase()}-DEMO-01`,
        expiresOn: '2027-06-30',
        inspectedAt: at.toISOString(),
        condition: 'usable',
        ambientOnly: true,
        quantityOnHand:
          source.stock[offer.drug] + (delivered ? offer.quantity : 0),
        safetyFloor: source.safetyFloor[offer.drug],
        quantityRequested: offer.quantity,
      },
      timeline,
      allowedActions: delivered ? [] : ['View evidence'],
      nextAccountableOwner: delivered
        ? 'none'
        : dispatched
          ? 'rider'
          : 'source_custodian',
    });
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
    const failures = [...this.transfers.values()]
      .filter((t) => t.status === 'locked')
      .map((t) => ({
        id: t.id,
        category: 'proof_locked' as const,
        reference: t.reference,
        occurredAt: now.toISOString(),
        detail: 'Delivery proof locked after two invalid attempts.',
      }));
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

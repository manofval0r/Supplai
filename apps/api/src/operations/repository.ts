import type {
  DeliveryResult,
  LgaOverview,
  OrderDetail,
  OperationalFailure,
  TransferSummary,
} from '@supplai/contracts';

export interface DispatchCandidate {
  transferId: string;
  transferReference: string;
  pickupFacilityId: string;
  deliveryFacilityId: string;
  quantity: number;
}

export type OrderView = {
  role: 'facility' | 'rider' | 'lga';
  facilityId?: string;
  riderName?: string;
};

export type TransferEventOutcome = 'recorded' | 'not_found' | 'already_closed';

export type ReceiptRefusalOutcome =
  'refused' | 'not_found' | 'unauthorized' | 'already_closed';

export interface OperationsRepository {
  prepareDispatch(input: {
    requestReference: string;
    proofHash: string;
    proofExpiresAt: Date;
    now: Date;
  }): Promise<DispatchCandidate | null>;
  markDispatched(input: {
    transferReference: string;
    externalDispatchId: string;
    now: Date;
  }): Promise<void>;
  verifyDelivery(input: {
    transferReference: string;
    proofHash: string;
    verifierPhone: string;
    now: Date;
  }): Promise<DeliveryResult>;
  recordTransferEvent(input: {
    transferReference: string;
    eventType: 'picked_up' | 'in_transit';
    actorRole: 'rider' | 'system';
    detail: string;
    now: Date;
  }): Promise<TransferEventOutcome>;
  refuseReceipt(input: {
    transferReference: string;
    actorPhone: string;
    reason: string;
    now: Date;
  }): Promise<ReceiptRefusalOutcome>;
  getTransfer(reference: string): Promise<TransferSummary | null>;
  getOrderDetail(reference: string): Promise<OrderDetail | null>;
  listOrders(view: OrderView): Promise<OrderDetail[]>;
  getOverview(now: Date): Promise<LgaOverview>;
  getFailures(now: Date): Promise<OperationalFailure[]>;
}

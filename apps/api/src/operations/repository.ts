import type {
  DeliveryResult,
  LgaOverview,
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
  getTransfer(reference: string): Promise<TransferSummary | null>;
  getOverview(now: Date): Promise<LgaOverview>;
  getFailures(now: Date): Promise<OperationalFailure[]>;
}

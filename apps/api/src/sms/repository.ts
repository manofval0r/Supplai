import type { InboundSmsEvent } from '@supplai/contracts';

export interface SupplyMatch {
  id: string;
  facilityName: string;
  sourcePhone: string;
  quantity: number;
  expiresAt: string;
}

export type ConfirmationResult =
  'confirmed' | 'declined' | 'expired' | 'not_found' | 'already_closed';

export interface SmsRepository {
  recordInbound(event: InboundSmsEvent): Promise<'created' | 'duplicate'>;
  recordOutbound(
    phone: string,
    body: string,
    requestReference?: string,
  ): Promise<void>;
  createRequest(input: {
    phone: string;
    medicine: string;
    quantity: number;
    rawText: string;
    now: Date;
  }): Promise<{ reference: string; match: SupplyMatch } | null>;
  respondToOffer(input: {
    actorPhone: string;
    reference: string;
    accept: boolean;
    now: Date;
  }): Promise<ConfirmationResult>;
}

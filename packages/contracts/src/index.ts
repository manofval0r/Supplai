import { z } from 'zod';

export const requestStatusSchema = z.enum([
  'open',
  'matched',
  'confirmed',
  'dispatched',
  'delivered',
  'failed',
  'expired',
]);

export const transferStatusSchema = z.enum([
  'pending',
  'dispatched',
  'in_transit',
  'delivered',
  'failed',
  'locked',
]);

export const healthResponseSchema = z.object({
  service: z.literal('supplai-api'),
  status: z.literal('ok'),
  timestamp: z.iso.datetime(),
});

export const inboundSmsEventSchema = z.object({
  provider: z.string().min(1),
  providerMessageId: z.string().min(1),
  from: z.string().regex(/^\+[1-9]\d{7,14}$/),
  body: z.string().trim().min(1).max(480),
  receivedAt: z.iso.datetime(),
});

export const demoSmsRequestSchema = z.object({
  from: z.string().min(8),
  body: z.string().trim().min(1).max(480),
  providerMessageId: z.string().min(1).optional(),
});

export const smsProcessingResultSchema = z.object({
  duplicate: z.boolean(),
  requestReference: z.string().min(1).optional(),
  reply: z.string().min(1),
  status: z.enum([
    'accepted',
    'offered',
    'confirmed',
    'declined',
    'expired',
    'unmatched',
    'invalid',
  ]),
});

export const transferSummarySchema = z.object({
  id: z.uuid(),
  reference: z.string().min(1),
  fromFacility: z.string().min(1),
  toFacility: z.string().min(1),
  drug: z.string().min(1),
  quantity: z.number().int().positive(),
  status: transferStatusSchema,
  createdAt: z.iso.datetime(),
});

export const operationalFailureSchema = z.object({
  id: z.uuid(),
  category: z.enum(['unmatched', 'expired', 'dispatch', 'proof_locked']),
  reference: z.string().min(1),
  occurredAt: z.iso.datetime(),
  detail: z.string().min(1),
});

export const lgaOverviewSchema = z.object({
  lgaCode: z.string().min(1),
  generatedAt: z.iso.datetime(),
  metrics: z.object({
    openStockouts: z.number().int().nonnegative(),
    transfersInFlight: z.number().int().nonnegative(),
    completedTransfers: z.number().int().nonnegative(),
    unmetRequests: z.number().int().nonnegative(),
    responseRate: z.number().min(0).max(1),
  }),
  transfers: z.array(transferSummarySchema),
});

export const dispatchRequestSchema = z.object({
  transferId: z.uuid(),
  pickupFacilityId: z.uuid(),
  deliveryFacilityId: z.uuid(),
  quantity: z.number().int().positive(),
});

export const dispatchResultSchema = z.object({
  externalId: z.string().min(1),
  status: z.enum(['assigned', 'in_transit', 'delivered', 'failed']),
});

export const createDemoDispatchSchema = z.object({
  requestReference: z.string().min(1),
});

export const demoDispatchResultSchema = z.object({
  transferReference: z.string().min(1),
  externalDispatchId: z.string().min(1),
  receiverProofCode: z.string().regex(/^\d{4}$/),
  proofExpiresAt: z.iso.datetime(),
});

export const verifyDeliverySchema = z.object({
  code: z.string().regex(/^\d{4}$/),
  verifierPhone: z.string().regex(/^\+[1-9]\d{7,14}$/),
});

export const deliveryResultSchema = z.object({
  status: z.enum([
    'delivered',
    'invalid_proof',
    'locked',
    'expired',
    'already_closed',
    'not_found',
    'unauthorized',
  ]),
  attemptsRemaining: z.number().int().min(0).max(2),
});

export const stockEvidenceSchema = z
  .object({
    commodity: z.enum(['ors', 'zinc']),
    batchNumber: z.string().trim().min(1),
    expiresOn: z.iso.date(),
    inspectedAt: z.iso.datetime(),
    condition: z.literal('usable'),
    ambientOnly: z.literal(true),
    quantityOnHand: z.number().int().nonnegative(),
    safetyFloor: z.number().int().nonnegative(),
    quantityRequested: z.number().int().positive(),
  })
  .superRefine((evidence, context) => {
    if (
      evidence.quantityOnHand - evidence.quantityRequested <
      evidence.safetyFloor
    ) {
      context.addIssue({
        code: 'custom',
        path: ['quantityRequested'],
        message: 'Transfer would breach the source safety floor',
      });
    }
    if (
      new Date(`${evidence.expiresOn}T23:59:59.999Z`) <=
      new Date(evidence.inspectedAt)
    ) {
      context.addIssue({
        code: 'custom',
        path: ['expiresOn'],
        message: 'Batch is expired at inspection time',
      });
    }
  });

export const canonicalEventSchema = z.object({
  sequence: z.number().int().positive(),
  type: z.enum([
    'request_created',
    'source_confirmation_requested',
    'source_released',
    'rider_assigned',
    'picked_up',
    'in_transit',
    'receiving_inspected',
    'received',
    'escalated',
  ]),
  occurredAt: z.iso.datetime(),
  actorRole: z.enum([
    'facility_requester',
    'source_custodian',
    'lga',
    'rider',
    'system',
  ]),
  label: z.string().min(1),
});

export const orderDetailSchema = z.object({
  reference: z.string().min(1),
  status: z.enum([
    'needs_review',
    'awaiting_source_confirmation',
    'rider_en_route',
    'received',
    'escalated',
  ]),
  commodity: z.enum(['ors', 'zinc']),
  quantity: z.number().int().positive(),
  sourceFacility: z.string().min(1),
  requestingFacility: z.string().min(1),
  evidence: stockEvidenceSchema,
  timeline: z.array(canonicalEventSchema),
  allowedActions: z.array(z.string().min(1)),
  nextAccountableOwner: z.enum([
    'source_custodian',
    'lga',
    'rider',
    'receiving_facility',
    'none',
  ]),
});

export const scenarioRunSchema = z.object({
  scenarioId: z.literal('authorised-ambient-transfer'),
  fixtureVersion: z.string().regex(/^\d+\.\d+\.\d+$/),
  runId: z.string().min(1),
  cursor: z.number().int().nonnegative(),
  state: z.enum(['ready', 'running', 'completed']),
  outcome: z.enum(['authorised_transfer_received']).nullable(),
  events: z.array(canonicalEventSchema),
});

export interface DispatchAdapter {
  createDispatch(
    request: z.infer<typeof dispatchRequestSchema>,
  ): Promise<z.infer<typeof dispatchResultSchema>>;
}

export type HealthResponse = z.infer<typeof healthResponseSchema>;
export type InboundSmsEvent = z.infer<typeof inboundSmsEventSchema>;
export type DemoSmsRequest = z.infer<typeof demoSmsRequestSchema>;
export type SmsProcessingResult = z.infer<typeof smsProcessingResultSchema>;
export type LgaOverview = z.infer<typeof lgaOverviewSchema>;
export type OperationalFailure = z.infer<typeof operationalFailureSchema>;
export type TransferSummary = z.infer<typeof transferSummarySchema>;
export type DemoDispatchResult = z.infer<typeof demoDispatchResultSchema>;
export type DeliveryResult = z.infer<typeof deliveryResultSchema>;
export type StockEvidence = z.infer<typeof stockEvidenceSchema>;
export type CanonicalEvent = z.infer<typeof canonicalEventSchema>;
export type OrderDetail = z.infer<typeof orderDetailSchema>;
export type ScenarioRun = z.infer<typeof scenarioRunSchema>;

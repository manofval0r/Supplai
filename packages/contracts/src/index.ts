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
  fromFacilityId: z.uuid().optional(),
  toFacilityId: z.uuid().optional(),
  riderName: z.string().min(1).optional(),
  requestReference: z.string().min(1).optional(),
  dispatchedAt: z.iso.datetime().optional(),
  deliveredAt: z.iso.datetime().optional(),
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
    'awaiting_dispatch',
    'rider_en_route',
    'received',
    'escalated',
  ]),
  commodity: z.enum(['ors', 'zinc']),
  quantity: z.number().int().positive(),
  sourceFacility: z.string().min(1),
  requestingFacility: z.string().min(1),
  sourceFacilityId: z.string().min(1).optional(),
  requestingFacilityId: z.string().min(1).optional(),
  transferReference: z.string().min(1).nullable(),
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

const nigerianPhoneSchema = z.string().regex(/^\+[1-9]\d{7,14}$/);

export const commoditySchema = z.enum(['ors', 'zinc']);

export const createAppRequestSchema = z.object({
  facilityPhone: nigerianPhoneSchema,
  commodity: commoditySchema,
  quantity: z.number().int().positive().max(500),
});

export const appRequestResultSchema = z.object({
  status: z.enum(['offered', 'unmatched']),
  requestReference: z.string().min(1).nullable(),
  sourceFacility: z.string().min(1).nullable(),
  message: z.string().min(1),
});

export const orderActionSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('confirm_release'),
    actorPhone: nigerianPhoneSchema,
  }),
  z.object({
    action: z.literal('decline_release'),
    actorPhone: nigerianPhoneSchema,
  }),
  z.object({
    action: z.literal('mark_picked_up'),
    actorPhone: nigerianPhoneSchema,
    riderName: z.string().trim().min(1).max(80),
  }),
  z.object({
    action: z.literal('mark_in_transit'),
    actorPhone: nigerianPhoneSchema,
  }),
  z.object({
    action: z.literal('receive'),
    actorPhone: nigerianPhoneSchema,
    proofCode: z.string().regex(/^\d{4}$/),
  }),
  z.object({
    action: z.literal('refuse_receipt'),
    actorPhone: nigerianPhoneSchema,
    reason: z.string().trim().min(3).max(240),
  }),
]);

export const orderActionResultSchema = z.object({
  accepted: z.boolean(),
  message: z.string().min(1),
  order: orderDetailSchema.nullable(),
});

export const notificationKindSchema = z.enum([
  'source_confirmation_requested',
  'source_released',
  'source_declined',
  'rider_assigned',
  'picked_up',
  'in_transit',
  'receiving_action_required',
  'received',
  'receipt_refused',
  'escalated',
]);

export const notificationEventSchema = z.object({
  id: z.string().min(1),
  kind: notificationKindSchema,
  severity: z.enum(['info', 'action', 'critical']),
  title: z.string().min(1),
  body: z.string().min(1),
  occurredAt: z.iso.datetime(),
  orderReference: z.string().min(1).nullable(),
  deepLink: z.string().min(1).nullable(),
  audience: z.enum(['facility_requester', 'source_custodian', 'rider', 'lga']),
});

export const notificationFeedSchema = z.object({
  generatedAt: z.iso.datetime(),
  events: z.array(notificationEventSchema),
});

type NotificationAudience = NotificationEvent['audience'];

const notificationCopy: Record<
  CanonicalEvent['type'],
  {
    kind: NotificationKind;
    title: string;
    audiences: NotificationAudience[];
    severity: NotificationEvent['severity'];
  }
> = {
  request_created: {
    kind: 'source_confirmation_requested',
    title: 'Stock request raised',
    audiences: ['facility_requester'],
    severity: 'info',
  },
  source_confirmation_requested: {
    kind: 'source_confirmation_requested',
    title: 'Source release needed',
    audiences: ['source_custodian'],
    severity: 'action',
  },
  source_released: {
    kind: 'source_released',
    title: 'Source stock released',
    audiences: ['facility_requester', 'rider'],
    severity: 'info',
  },
  rider_assigned: {
    kind: 'rider_assigned',
    title: 'Rider assigned',
    audiences: ['rider', 'facility_requester'],
    severity: 'info',
  },
  picked_up: {
    kind: 'picked_up',
    title: 'Medicine picked up',
    audiences: ['facility_requester', 'rider'],
    severity: 'info',
  },
  in_transit: {
    kind: 'in_transit',
    title: 'Transfer in transit',
    audiences: ['facility_requester', 'rider'],
    severity: 'action',
  },
  receiving_inspected: {
    kind: 'receiving_action_required',
    title: 'Inspect and receive',
    audiences: ['facility_requester'],
    severity: 'action',
  },
  received: {
    kind: 'received',
    title: 'Transfer received',
    audiences: ['facility_requester', 'source_custodian', 'rider', 'lga'],
    severity: 'info',
  },
  escalated: {
    kind: 'escalated',
    title: 'Transfer escalated',
    audiences: ['facility_requester', 'source_custodian', 'rider', 'lga'],
    severity: 'critical',
  },
};

/**
 * One canonical event stream, projected for a specific role. The API returns
 * this feed and the mobile app renders it unchanged so both stay in step.
 */
export function deriveOrderNotifications(
  order: OrderDetail,
  audience: NotificationAudience,
): NotificationEvent[] {
  return order.timeline
    .filter((entry) => entry.type !== 'request_created')
    .filter((entry) =>
      notificationCopy[entry.type].audiences.includes(audience),
    )
    .map((entry) => {
      const copy = notificationCopy[entry.type];
      return notificationEventSchema.parse({
        id: `${order.reference}:${entry.sequence}:${copy.kind}`,
        kind: copy.kind,
        severity: copy.severity,
        title: copy.title,
        body: `${entry.label} for ${order.reference}.`,
        occurredAt: entry.occurredAt,
        orderReference: order.reference,
        deepLink: `supplai://orders/${order.reference}`,
        audience,
      });
    });
}

export const scenarioRunSchema = z.object({
  scenarioId: z.literal('authorised-ambient-transfer'),
  fixtureVersion: z.string().regex(/^\d+\.\d+\.\d+$/),
  runId: z.string().min(1),
  cursor: z.number().int().nonnegative(),
  state: z.enum(['ready', 'running', 'completed']),
  outcome: z.enum(['authorised_transfer_received']).nullable(),
  events: z.array(canonicalEventSchema),
});

export const facilityFixtureSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  ward: z.string().min(1),
  phone: nigerianPhoneSchema,
  coordinates: z.object({ x: z.number(), y: z.number() }),
  publicLedger: z.boolean(),
});

export const medicineFixtureSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  unit: z.string().min(1),
  aliases: z.array(z.string().trim().min(1)).min(1),
});

export const stockFixtureSchema = z.object({
  facilityId: z.string().min(1),
  medicineId: z.string().min(1),
  onHand: z.number().int().nonnegative(),
  minimum: z.number().int().nonnegative(),
});

export const riderFixtureSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  phone: nigerianPhoneSchema,
});

export const dashboardDirectorySchema = z.object({
  lgaCode: z.string().min(1),
  facilities: z.array(facilityFixtureSchema),
  medicines: z.array(medicineFixtureSchema),
  riders: z.array(riderFixtureSchema),
  stock: z.array(stockFixtureSchema),
});

/**
 * Surplus a facility can release without breaching its own minimum cover.
 * Shared so the API, dashboard, and mobile app apply one rule.
 */
export function transferableSurplus(
  stock: z.infer<typeof stockFixtureSchema>,
): number {
  return Math.max(0, stock.onHand - stock.minimum);
}

export interface DispatchAdapter {
  createDispatch(
    request: z.infer<typeof dispatchRequestSchema>,
  ): Promise<z.infer<typeof dispatchResultSchema>>;
  updateDispatch?(input: {
    externalId: string;
    status: 'in_transit' | 'delivered' | 'failed';
    at: string;
  }): Promise<z.infer<typeof dispatchResultSchema>>;
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
export type Commodity = z.infer<typeof commoditySchema>;
export type CreateAppRequest = z.infer<typeof createAppRequestSchema>;
export type AppRequestResult = z.infer<typeof appRequestResultSchema>;
export type OrderAction = z.infer<typeof orderActionSchema>;
export type OrderActionResult = z.infer<typeof orderActionResultSchema>;
export type NotificationKind = z.infer<typeof notificationKindSchema>;
export type NotificationEvent = z.infer<typeof notificationEventSchema>;
export type NotificationFeed = z.infer<typeof notificationFeedSchema>;
export type FacilityFixture = z.infer<typeof facilityFixtureSchema>;
export type MedicineFixture = z.infer<typeof medicineFixtureSchema>;
export type StockFixture = z.infer<typeof stockFixtureSchema>;
export type RiderFixture = z.infer<typeof riderFixtureSchema>;
export type DashboardDirectory = z.infer<typeof dashboardDirectorySchema>;

import {
  appRequestResultSchema,
  deriveOrderNotifications,
  notificationFeedSchema,
  orderActionResultSchema,
  type AppRequestResult,
  type CreateAppRequest,
  type NotificationFeed,
  type OrderAction,
  type OrderActionResult,
  type OrderDetail,
} from '@supplai/contracts';

import type { OperationsService } from '../operations/service.js';
import type {
  OperationsRepository,
  OrderView,
} from '../operations/repository.js';
import type { SmsRepository } from '../sms/repository.js';

const requestMedicine: Record<CreateAppRequest['commodity'], string> = {
  ors: 'ORS',
  zinc: 'zinc',
};

export class AppService {
  constructor(
    private readonly repository: SmsRepository & OperationsRepository,
    private readonly operations: OperationsService,
  ) {}

  async createRequest(input: CreateAppRequest): Promise<AppRequestResult> {
    const medicine = requestMedicine[input.commodity];
    const created = await this.repository.createRequest({
      phone: input.facilityPhone,
      medicine,
      quantity: input.quantity,
      rawText: `NEED ${medicine} ${input.quantity}`,
      now: new Date(),
    });
    if (!created)
      return appRequestResultSchema.parse({
        status: 'unmatched',
        requestReference: null,
        sourceFacility: null,
        message:
          'No eligible source stock is available without breaching a safety floor.',
      });
    return appRequestResultSchema.parse({
      status: 'offered',
      requestReference: created.reference,
      sourceFacility: created.match.facilityName,
      message: `${created.match.facilityName} has been asked to release ${created.match.quantity} units within 10 minutes.`,
    });
  }

  async act(
    reference: string,
    action: OrderAction,
    now = new Date(),
  ): Promise<OrderActionResult> {
    const before = await this.repository.getOrderDetail(reference);
    if (!before)
      return orderActionResultSchema.parse({
        accepted: false,
        message: 'Order not found.',
        order: null,
      });

    const reject = async (message: string) =>
      orderActionResultSchema.parse({
        accepted: false,
        message,
        order: await this.repository.getOrderDetail(reference),
      });

    switch (action.action) {
      case 'confirm_release':
      case 'decline_release': {
        const outcome = await this.repository.respondToOffer({
          actorPhone: action.actorPhone,
          reference,
          accept: action.action === 'confirm_release',
          now,
        });
        if (outcome === 'not_found')
          return reject(
            'This phone is not the source custodian for that order.',
          );
        if (outcome === 'already_closed')
          return reject('That source decision is already recorded.');
        if (outcome === 'expired')
          return reject(
            'The confirmation window has expired. Raise a new request.',
          );
        return orderActionResultSchema.parse({
          accepted: true,
          message:
            outcome === 'confirmed'
              ? 'Release authorised. The LGA can now dispatch.'
              : 'Release declined. The order will need a new source.',
          order: await this.repository.getOrderDetail(reference),
        });
      }
      case 'mark_picked_up':
      case 'mark_in_transit': {
        const transferReference = before.transferReference;
        if (!transferReference)
          return reject('No rider transfer exists for that order yet.');
        const outgoing = await this.repository.recordTransferEvent({
          transferReference,
          eventType:
            action.action === 'mark_picked_up' ? 'picked_up' : 'in_transit',
          actorRole: 'rider',
          detail:
            action.action === 'mark_picked_up'
              ? `Picked up by ${action.riderName}`
              : 'Rider is on the way to the receiving facility',
          now,
        });
        if (outgoing === 'not_found') return reject('Transfer not found.');
        if (outgoing === 'already_closed')
          return reject('That transfer is already closed.');
        return orderActionResultSchema.parse({
          accepted: true,
          message:
            action.action === 'mark_picked_up'
              ? 'Pickup recorded. Start the trip when you are ready.'
              : 'In-transit recorded. The receiving facility has been alerted.',
          order: await this.repository.getOrderDetail(reference),
        });
      }
      case 'receive': {
        const transferReference = before.transferReference;
        if (!transferReference)
          return reject('No rider transfer exists for that order yet.');
        const result = await this.operations.verifyDelivery(
          transferReference,
          action.proofCode,
          action.actorPhone,
          now,
        );
        const messages: Record<typeof result.status, string> = {
          delivered: 'Handover accepted. Stock records are updated.',
          invalid_proof: `Wrong code. ${result.attemptsRemaining} attempt(s) left.`,
          locked: 'Too many wrong codes. The transfer is locked for review.',
          expired: 'The handover code has expired.',
          already_closed: 'That transfer is already closed.',
          not_found: 'Transfer not found.',
          unauthorized: 'This phone is not the receiving facility.',
        };
        return orderActionResultSchema.parse({
          accepted: result.status === 'delivered',
          message: messages[result.status],
          order: await this.repository.getOrderDetail(reference),
        });
      }
      case 'refuse_receipt': {
        const transferReference = before.transferReference;
        if (!transferReference)
          return reject('No rider transfer exists for that order yet.');
        const outcome = await this.repository.refuseReceipt({
          transferReference,
          actorPhone: action.actorPhone,
          reason: action.reason,
          now,
        });
        if (outcome === 'not_found') return reject('Transfer not found.');
        if (outcome === 'unauthorized')
          return reject('This phone is not the receiving facility.');
        if (outcome === 'already_closed')
          return reject('That transfer is already closed.');
        return orderActionResultSchema.parse({
          accepted: true,
          message: 'Receipt refused and escalated to the LGA.',
          order: await this.repository.getOrderDetail(reference),
        });
      }
    }
  }

  async inbox(view: OrderView, now = new Date()): Promise<NotificationFeed> {
    const orders: OrderDetail[] = await this.repository.listOrders(view);
    const events = orders.flatMap((order) => {
      if (view.role === 'lga') return deriveOrderNotifications(order, 'lga');
      if (view.role === 'rider')
        return deriveOrderNotifications(order, 'rider');
      const projected = [];
      if (order.requestingFacilityId === view.facilityId)
        projected.push(
          ...deriveOrderNotifications(order, 'facility_requester'),
        );
      if (order.sourceFacilityId === view.facilityId)
        projected.push(...deriveOrderNotifications(order, 'source_custodian'));
      return projected;
    });
    return notificationFeedSchema.parse({
      generatedAt: now.toISOString(),
      events: events.sort((left, right) =>
        right.occurredAt.localeCompare(left.occurredAt),
      ),
    });
  }
}

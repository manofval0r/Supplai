import {
  inboundSmsEventSchema,
  smsProcessingResultSchema,
  type InboundSmsEvent,
  type SmsProcessingResult,
} from '@supplai/contracts';

import { parseSms } from './parser.js';
import type { SmsRepository } from './repository.js';

const INVALID_REPLY =
  'Use NEED <medicine> <quantity>, CONFIRM <reference>, or DECLINE <reference>.';

export class SmsService {
  constructor(private readonly repository: SmsRepository) {}

  async process(rawEvent: InboundSmsEvent): Promise<SmsProcessingResult> {
    const event = inboundSmsEventSchema.parse(rawEvent);
    if ((await this.repository.recordInbound(event)) === 'duplicate') {
      return smsProcessingResultSchema.parse({
        duplicate: true,
        reply: 'Message already processed.',
        status: 'accepted',
      });
    }

    const parsed = parseSms(event.body);
    if (parsed.kind === 'invalid')
      return this.reply(event.from, INVALID_REPLY, 'invalid');

    if (parsed.kind === 'request') {
      const created = await this.repository.createRequest({
        phone: event.from,
        medicine: parsed.medicine,
        quantity: parsed.quantity,
        rawText: event.body,
        now: new Date(event.receivedAt),
      });
      if (!created)
        return this.reply(
          event.from,
          `No eligible stock found for ${parsed.medicine}.`,
          'unmatched',
        );
      await this.repository.recordOutbound(
        created.match.sourcePhone,
        `Stock request ${created.reference}: confirm ${created.match.quantity} units are releasable. Reply CONFIRM ${created.reference} or DECLINE ${created.reference} within 10 minutes.`,
        created.reference,
      );
      const text = `${created.reference} sent to ${created.match.facilityName} for source-stock confirmation.`;
      return this.reply(event.from, text, 'offered', created.reference);
    }

    const outcome = await this.repository.respondToOffer({
      actorPhone: event.from,
      reference: parsed.reference,
      accept: parsed.kind === 'confirm',
      now: new Date(event.receivedAt),
    });
    const messages = {
      confirmed: [
        `${parsed.reference} confirmed. Dispatch preparation has started.`,
        'confirmed',
      ],
      declined: [`${parsed.reference} declined.`, 'declined'],
      expired: [
        `${parsed.reference} has expired. Send a new NEED request.`,
        'expired',
      ],
      not_found: [
        `${parsed.reference} was not found for this phone number.`,
        'invalid',
      ],
      already_closed: [`${parsed.reference} is already closed.`, 'invalid'],
    } as const;
    const [text, status] = messages[outcome];
    return this.reply(event.from, text, status, parsed.reference);
  }

  private async reply(
    phone: string,
    reply: string,
    status: SmsProcessingResult['status'],
    requestReference?: string,
  ) {
    await this.repository.recordOutbound(phone, reply, requestReference);
    return smsProcessingResultSchema.parse({
      duplicate: false,
      reply,
      status,
      ...(requestReference ? { requestReference } : {}),
    });
  }
}

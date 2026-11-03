import { z } from 'zod';

import {
  inboundSmsEventSchema,
  type InboundSmsEvent,
} from '@supplai/contracts';

import { normalizeNigerianPhone } from './phone.js';

const genericSchema = z.object({
  id: z.string().min(1),
  from: z.string().min(1),
  text: z.string().min(1),
});
const twilioSchema = z.object({
  MessageSid: z.string().min(1),
  From: z.string().min(1),
  Body: z.string().min(1),
});

export function adaptProviderPayload(
  provider: string,
  payload: unknown,
  now = new Date(),
): InboundSmsEvent {
  const normalized = provider.toLowerCase();
  if (normalized === 'twilio') {
    const data = twilioSchema.parse(payload);
    return inboundSmsEventSchema.parse({
      provider: normalized,
      providerMessageId: data.MessageSid,
      from: normalizeNigerianPhone(data.From),
      body: data.Body,
      receivedAt: now.toISOString(),
    });
  }

  const data = genericSchema.parse(payload);
  const event = {
    provider: normalized,
    providerMessageId: data.id,
    from: normalizeNigerianPhone(data.from),
    body: data.text,
    receivedAt: now.toISOString(),
  };
  return inboundSmsEventSchema.parse(event);
}

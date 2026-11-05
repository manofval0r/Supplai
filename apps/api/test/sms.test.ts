import { describe, expect, it } from 'vitest';

import { buildApp } from '../src/app.js';
import { InMemorySmsRepository } from '../src/sms/memory-repository.js';
import { parseSms } from '../src/sms/parser.js';
import { normalizeNigerianPhone } from '../src/sms/phone.js';
import { SmsService } from '../src/sms/service.js';

const receivedAt = '2026-11-03T12:00:00.000Z';

describe('SMS parsing and normalization', () => {
  it.each([
    ['08010000001', '+2348010000001'],
    ['2348010000001', '+2348010000001'],
    ['+234 801 000 0001', '+2348010000001'],
  ])('normalizes %s', (input, expected) =>
    expect(normalizeNigerianPhone(input)).toBe(expected),
  );

  it('parses request, confirmation, and decline commands', () => {
    expect(parseSms('NEED zinc tablet 12')).toEqual({
      kind: 'request',
      medicine: 'zinc tablet',
      quantity: 12,
    });
    expect(parseSms('YES req-ab12')).toEqual({
      kind: 'confirm',
      reference: 'REQ-AB12',
    });
    expect(parseSms('NO req-ab12')).toEqual({
      kind: 'decline',
      reference: 'REQ-AB12',
    });
  });
});

describe('SMS workflow', () => {
  it('requires the selected source custodian to confirm an offer', async () => {
    const repository = new InMemorySmsRepository();
    const service = new SmsService(repository);
    const offer = await service.process({
      provider: 'demo',
      providerMessageId: 'one',
      from: '+2348010000001',
      body: 'NEED ORS 20',
      receivedAt,
    });
    expect(offer.status).toBe('offered');
    const reference = offer.requestReference;
    expect(reference).toBeDefined();
    if (!reference) throw new Error('Offered request must have a reference');

    const requesterAttempt = await service.process({
      provider: 'demo',
      providerMessageId: 'requester-confirm',
      from: '+2348010000001',
      body: `CONFIRM ${reference}`,
      receivedAt,
    });
    expect(requesterAttempt.status).toBe('invalid');

    const event = {
      provider: 'demo',
      from: '+2348010000002',
      body: `CONFIRM ${reference}`,
      receivedAt,
    };
    const results = await Promise.all([
      service.process({ ...event, providerMessageId: 'two' }),
      service.process({ ...event, providerMessageId: 'three' }),
    ]);
    expect(results.map((result) => result.status).sort()).toEqual([
      'confirmed',
      'invalid',
    ]);
    expect(
      repository.outbound.some(
        (message) =>
          message.phone === '+2348010000002' &&
          message.body.includes(`CONFIRM ${reference}`),
      ),
    ).toBe(true);
  });

  it('rejects duplicate provider messages and expired confirmations', async () => {
    const repository = new InMemorySmsRepository();
    const service = new SmsService(repository);
    const event = {
      provider: 'demo',
      providerMessageId: 'same',
      from: '+2348010000001',
      body: 'NEED zinc 10',
      receivedAt,
    };
    const offer = await service.process(event);
    expect((await service.process(event)).duplicate).toBe(true);
    const expired = await service.process({
      ...event,
      providerMessageId: 'later',
      from: '+2348010000002',
      body: `CONFIRM ${offer.requestReference!}`,
      receivedAt: '2026-11-03T12:11:00.000Z',
    });
    expect(expired.status).toBe('expired');
  });

  it('does not offer stock that would breach the source safety floor', async () => {
    const repository = new InMemorySmsRepository();
    const service = new SmsService(repository);
    const result = await service.process({
      provider: 'demo',
      providerMessageId: 'safety-floor',
      from: '+2348010000001',
      body: 'NEED ORS 70',
      receivedAt,
    });
    expect(result.status).toBe('unmatched');
  });

  it('serves demo and authenticated provider webhook routes', async () => {
    const app = buildApp({ webhookSecret: 'a-secure-webhook-secret' });
    const demo = await app.inject({
      method: 'POST',
      url: '/demo/sms',
      payload: {
        from: '08010000001',
        body: 'NEED rehidration salt 10',
        providerMessageId: 'route-1',
      },
    });
    expect(demo.statusCode).toBe(201);
    expect(demo.json<{ status: string }>().status).toBe('offered');

    const unauthorized = await app.inject({
      method: 'POST',
      url: '/webhooks/sms/twilio',
      payload: {
        MessageSid: 'SM1',
        From: '+2348010000001',
        Body: 'NEED zinc 2',
      },
    });
    expect(unauthorized.statusCode).toBe(401);
    const accepted = await app.inject({
      method: 'POST',
      url: '/webhooks/sms/twilio',
      headers: { 'x-webhook-secret': 'a-secure-webhook-secret' },
      payload: {
        MessageSid: 'SM1',
        From: '+2348010000001',
        Body: 'NEED zinc 2',
      },
    });
    expect(accepted.statusCode).toBe(200);
    await app.close();
  });
});

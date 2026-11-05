import { describe, expect, it } from 'vitest';

import { buildApp } from '../src/app.js';
import { MockDispatchAdapter } from '../src/operations/mock-dispatch.js';
import { OperationsService } from '../src/operations/service.js';
import { InMemorySmsRepository } from '../src/sms/memory-repository.js';
import { SmsService } from '../src/sms/service.js';

const proofSecret = 'test-proof-secret-with-at-least-32-characters';
const receivedAt = '2026-11-03T12:00:00.000Z';

async function confirmedWorkflow(repository: InMemorySmsRepository) {
  const sms = new SmsService(repository);
  const offer = await sms.process({
    provider: 'demo',
    providerMessageId: 'request',
    from: '+2348010000001',
    body: 'NEED ORS 20',
    receivedAt,
  });
  await sms.process({
    provider: 'demo',
    providerMessageId: 'confirm',
    from: '+2348010000002',
    body: `CONFIRM ${offer.requestReference!}`,
    receivedAt,
  });
  return offer.requestReference!;
}

describe('dispatch, proof, and ledger', () => {
  it('requires confirmation, completes once, and writes a correctly signed pair', async () => {
    const repository = new InMemorySmsRepository();
    const operations = new OperationsService(
      repository,
      new MockDispatchAdapter(),
      proofSecret,
    );
    expect(await operations.dispatchConfirmed('REQ-MISSING')).toBeNull();
    const requestReference = await confirmedWorkflow(repository);
    const dispatch = await operations.dispatchConfirmed(
      requestReference,
      new Date(receivedAt),
    );
    expect(dispatch?.receiverProofCode).toMatch(/^\d{4}$/);
    expect(repository.getStock('PHC-B', 'ors')).toBe(80);
    expect(repository.getStock('PHC-A', 'ors')).toBe(0);

    const result = await operations.verifyDelivery(
      dispatch!.transferReference,
      dispatch!.receiverProofCode,
      '+2348010000001',
      new Date('2026-11-03T12:05:00.000Z'),
    );
    expect(result.status).toBe('delivered');
    expect(repository.getMovementCount()).toBe(2);
    expect(repository.getStock('PHC-B', 'ors')).toBe(60);
    expect(repository.getStock('PHC-A', 'ors')).toBe(20);
    expect(
      (await repository.getTransfer(dispatch!.transferReference))?.status,
    ).toBe('delivered');
    expect(
      (
        await operations.verifyDelivery(
          dispatch!.transferReference,
          dispatch!.receiverProofCode,
          '+2348010000001',
        )
      ).status,
    ).toBe('already_closed');
  });

  it('rejects rider-style verification and locks after two bad receiver attempts without ledger writes', async () => {
    const repository = new InMemorySmsRepository();
    const operations = new OperationsService(
      repository,
      new MockDispatchAdapter(),
      proofSecret,
    );
    const dispatch = await operations.dispatchConfirmed(
      await confirmedWorkflow(repository),
      new Date(receivedAt),
    );
    expect(
      (
        await operations.verifyDelivery(
          dispatch!.transferReference,
          dispatch!.receiverProofCode,
          '+2348020000001',
        )
      ).status,
    ).toBe('unauthorized');
    expect(
      (
        await operations.verifyDelivery(
          dispatch!.transferReference,
          '1111',
          '+2348010000001',
          new Date('2026-11-03T12:05:00.000Z'),
        )
      ).status,
    ).toBe('invalid_proof');
    expect(
      (
        await operations.verifyDelivery(
          dispatch!.transferReference,
          '2222',
          '+2348010000001',
          new Date('2026-11-03T12:06:00.000Z'),
        )
      ).status,
    ).toBe('locked');
    expect(repository.getMovementCount()).toBe(0);
    expect((await repository.getFailures(new Date())).length).toBe(1);
  });

  it('exposes the complete demo workflow and dashboard-readable routes', async () => {
    const app = buildApp({ proofSecret });
    const offer = await app.inject({
      method: 'POST',
      url: '/demo/sms',
      payload: {
        from: '08010000001',
        body: 'NEED ORS 10',
        providerMessageId: 'e2e-request',
      },
    });
    const requestReference = offer.json<{ requestReference: string }>()
      .requestReference;
    await app.inject({
      method: 'POST',
      url: '/demo/sms',
      payload: {
        from: '08010000002',
        body: `CONFIRM ${requestReference}`,
        providerMessageId: 'e2e-confirm',
      },
    });
    const dispatched = await app.inject({
      method: 'POST',
      url: '/demo/dispatch',
      payload: { requestReference },
    });
    expect(dispatched.statusCode).toBe(201);
    const transfer = dispatched.json<{
      transferReference: string;
      receiverProofCode: string;
    }>();
    const delivered = await app.inject({
      method: 'POST',
      url: `/demo/delivery/${transfer.transferReference}`,
      payload: {
        code: transfer.receiverProofCode,
        verifierPhone: '+2348010000001',
      },
    });
    expect(delivered.json<{ status: string }>().status).toBe('delivered');
    expect(
      (
        await app.inject({
          method: 'GET',
          url: `/api/transfers/${transfer.transferReference}`,
        })
      ).json<{ status: string }>().status,
    ).toBe('delivered');
    const order = await app.inject({
      method: 'GET',
      url: `/api/orders/${requestReference}`,
    });
    expect(order.statusCode).toBe(200);
    expect(
      order.json<{ nextAccountableOwner: string }>().nextAccountableOwner,
    ).toBe('none');
    expect(order.json<{ timeline: unknown[] }>().timeline).toHaveLength(5);
    expect(
      (await app.inject({ method: 'GET', url: '/api/overview' })).json<{
        metrics: { completedTransfers: number };
      }>().metrics.completedTransfers,
    ).toBe(1);
    expect(
      (await app.inject({ method: 'GET', url: '/api/lga/overview' })).json<{
        metrics: { completedTransfers: number };
      }>().metrics.completedTransfers,
    ).toBe(1);
    expect(
      (await app.inject({ method: 'GET', url: '/api/lga/transfers' })).json<
        unknown[]
      >(),
    ).toHaveLength(1);
    expect(
      (await app.inject({ method: 'GET', url: '/api/failures' })).json<
        unknown[]
      >(),
    ).toHaveLength(0);
    expect(
      (
        await app.inject({ method: 'GET', url: '/api/operations/failures' })
      ).json<unknown[]>(),
    ).toHaveLength(0);
    await app.close();
  });
});

describe('Scenario Lab controls', () => {
  it('starts, ticks, replays, and resets a protected deterministic scenario', async () => {
    const app = buildApp({ scenarioControlSecret: 'scenario-control-secret' });
    const blocked = await app.inject({
      method: 'POST',
      url: '/demo/scenarios/authorised-ambient-transfer/start',
    });
    expect(blocked.statusCode).toBe(401);

    const headers = { 'x-demo-control-secret': 'scenario-control-secret' };
    const started = await app.inject({
      method: 'POST',
      url: '/demo/scenarios/authorised-ambient-transfer/start',
      headers,
    });
    expect(started.json<{ state: string; cursor: number }>().state).toBe(
      'running',
    );
    expect(started.json<{ cursor: number }>().cursor).toBe(0);

    const ticked = await app.inject({
      method: 'POST',
      url: '/demo/scenarios/authorised-ambient-transfer/tick',
      headers,
    });
    expect(ticked.json<{ cursor: number }>().cursor).toBe(1);

    const replayed = await app.inject({
      method: 'POST',
      url: '/demo/scenarios/authorised-ambient-transfer/replay',
      headers,
    });
    expect(replayed.json<{ cursor: number }>().cursor).toBe(1);

    const reset = await app.inject({
      method: 'POST',
      url: '/demo/scenarios/authorised-ambient-transfer/reset',
      headers,
    });
    expect(reset.json<{ state: string; cursor: number }>().state).toBe('ready');
    expect(reset.json<{ cursor: number }>().cursor).toBe(0);
    await app.close();
  });
});

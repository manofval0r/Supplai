import { describe, expect, it } from 'vitest';

import { buildApp } from '../src/app.js';

const proofSecret = 'test-proof-secret-with-at-least-32-characters';

const requesterPhone = '+2348010000001';
const sourcePhone = '+2348010000002';
const riderName = 'Demo Rider';

async function createRequest(app: ReturnType<typeof buildApp>, quantity = 20) {
  const response = await app.inject({
    method: 'POST',
    url: '/api/requests',
    payload: { facilityPhone: requesterPhone, commodity: 'ors', quantity },
  });
  expect(response.statusCode).toBe(201);
  return response.json<{ requestReference: string; sourceFacility: string }>();
}

async function act(
  app: ReturnType<typeof buildApp>,
  reference: string,
  payload: Record<string, unknown>,
) {
  return app.inject({
    method: 'POST',
    url: `/api/orders/${reference}/actions`,
    payload,
  });
}

describe('app request lifecycle', () => {
  it('runs request, release, dispatch, pickup, transit, and receipt end to end', async () => {
    const app = buildApp({ proofSecret });
    const created = await createRequest(app);
    expect(created.sourceFacility).toBe('Demo PHC B');

    const order = await app.inject({
      method: 'GET',
      url: `/api/orders/${created.requestReference}`,
    });
    expect(order.statusCode).toBe(200);
    expect(order.json<{ status: string }>().status).toBe(
      'awaiting_source_confirmation',
    );
    expect(
      order.json<{ nextAccountableOwner: string }>().nextAccountableOwner,
    ).toBe('source_custodian');

    const confirm = await act(app, created.requestReference, {
      action: 'confirm_release',
      actorPhone: sourcePhone,
    });
    expect(confirm.statusCode).toBe(200);
    expect(confirm.json<{ order: { status: string } }>().order.status).toBe(
      'awaiting_dispatch',
    );

    const dispatched = await app.inject({
      method: 'POST',
      url: '/demo/dispatch',
      payload: { requestReference: created.requestReference },
    });
    expect(dispatched.statusCode).toBe(201);
    const transfer = dispatched.json<{
      transferReference: string;
      receiverProofCode: string;
    }>();

    const pickup = await act(app, created.requestReference, {
      action: 'mark_picked_up',
      actorPhone: requesterPhone,
      riderName,
    });
    expect(pickup.statusCode).toBe(200);
    expect(
      pickup
        .json<{ order: { timeline: Array<{ type: string }> } }>()
        .order.timeline.at(-1)?.type,
    ).toBe('picked_up');

    const transit = await act(app, created.requestReference, {
      action: 'mark_in_transit',
      actorPhone: requesterPhone,
    });
    expect(transit.statusCode).toBe(200);
    expect(transit.json<{ order: { status: string } }>().order.status).toBe(
      'rider_en_route',
    );
    expect(
      transit.json<{ order: { nextAccountableOwner: string } }>().order
        .nextAccountableOwner,
    ).toBe('receiving_facility');

    const received = await act(app, created.requestReference, {
      action: 'receive',
      actorPhone: requesterPhone,
      proofCode: transfer.receiverProofCode,
    });
    expect(received.statusCode).toBe(200);
    const receivedOrder = received.json<{
      accepted: boolean;
      order: { status: string; timeline: Array<{ type: string }> };
    }>();
    expect(receivedOrder.accepted).toBe(true);
    expect(receivedOrder.order.status).toBe('received');
    expect(receivedOrder.order.timeline.map((entry) => entry.type)).toEqual([
      'request_created',
      'source_confirmation_requested',
      'source_released',
      'rider_assigned',
      'picked_up',
      'in_transit',
      'received',
    ]);
    expect(
      (await app.inject({ method: 'GET', url: '/api/overview' })).json<{
        metrics: { completedTransfers: number };
      }>().metrics.completedTransfers,
    ).toBe(1);

    await app.close();
  });

  it('refuses a handover with a reason and escalates to the LGA', async () => {
    const app = buildApp({ proofSecret });
    const created = await createRequest(app, 10);
    await act(app, created.requestReference, {
      action: 'confirm_release',
      actorPhone: sourcePhone,
    });
    await app.inject({
      method: 'POST',
      url: '/demo/dispatch',
      payload: { requestReference: created.requestReference },
    });
    await act(app, created.requestReference, {
      action: 'mark_picked_up',
      actorPhone: requesterPhone,
      riderName,
    });
    await act(app, created.requestReference, {
      action: 'mark_in_transit',
      actorPhone: requesterPhone,
    });

    const refused = await act(app, created.requestReference, {
      action: 'refuse_receipt',
      actorPhone: requesterPhone,
      reason: 'Seal broken on arrival',
    });
    expect(refused.statusCode).toBe(200);
    const order = refused.json<{
      order: {
        status: string;
        nextAccountableOwner: string;
        timeline: Array<{ type: string; label: string }>;
      };
    }>().order;
    expect(order.status).toBe('escalated');
    expect(order.nextAccountableOwner).toBe('lga');
    expect(order.timeline.at(-1)).toMatchObject({
      type: 'escalated',
      label: 'Seal broken on arrival',
    });
    expect(
      (
        await app.inject({ method: 'GET', url: '/api/operations/failures' })
      ).json<unknown[]>().length,
    ).toBe(1);

    await app.close();
  });

  it('rejects actions from the wrong authority and bad request bodies', async () => {
    const app = buildApp({ proofSecret });
    const created = await createRequest(app);
    const wrongSource = await act(app, created.requestReference, {
      action: 'confirm_release',
      actorPhone: requesterPhone,
    });
    expect(wrongSource.statusCode).toBe(409);
    expect(wrongSource.json<{ accepted: boolean }>().accepted).toBe(false);

    const missingRiderAction = await act(app, created.requestReference, {
      action: 'mark_picked_up',
      actorPhone: requesterPhone,
      riderName,
    });
    expect(missingRiderAction.statusCode).toBe(409);

    const unmatched = await app.inject({
      method: 'POST',
      url: '/api/requests',
      payload: {
        facilityPhone: requesterPhone,
        commodity: 'zinc',
        quantity: 500,
      },
    });
    expect(unmatched.statusCode).toBe(409);
    expect(unmatched.json<{ status: string }>().status).toBe('unmatched');

    await app.close();
  });
});

describe('notification feed', () => {
  it('projects the canonical event stream per role and facility', async () => {
    const app = buildApp({ proofSecret });
    const created = await createRequest(app);

    const sourceInbox = await app.inject({
      method: 'GET',
      url: `/api/notifications?role=facility&facilityId=PHC-B`,
    });
    expect(sourceInbox.statusCode).toBe(200);
    expect(
      sourceInbox
        .json<{ events: Array<{ kind: string; audience: string }> }>()
        .events.map((event) => event.kind),
    ).toEqual(['source_confirmation_requested']);

    await act(app, created.requestReference, {
      action: 'confirm_release',
      actorPhone: sourcePhone,
    });

    const requesterInbox = await app.inject({
      method: 'GET',
      url: `/api/notifications?role=facility&facilityId=PHC-A`,
    });
    const kinds = requesterInbox
      .json<{ events: Array<{ kind: string; orderReference: string }> }>()
      .events.map((event) => event.kind);
    expect(kinds).toContain('source_released');

    const lgaInbox = await app.inject({
      method: 'GET',
      url: '/api/notifications?role=lga',
    });
    expect(lgaInbox.statusCode).toBe(200);

    const invalid = await app.inject({
      method: 'GET',
      url: '/api/notifications',
    });
    expect(invalid.statusCode).toBe(400);
    const missingFacility = await app.inject({
      method: 'GET',
      url: '/api/notifications?role=facility',
    });
    expect(missingFacility.statusCode).toBe(400);

    await app.close();
  });
});

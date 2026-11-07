import Fastify, { type FastifyInstance } from 'fastify';

import {
  createAppRequestSchema,
  createDemoDispatchSchema,
  demoSmsRequestSchema,
  healthResponseSchema,
  orderActionSchema,
  scenarioIdSchema,
  verifyDeliverySchema,
} from '@supplai/contracts';

import { AppService } from './app-actions/service.js';
import { MockDispatchAdapter } from './operations/mock-dispatch.js';
import type {
  OperationsRepository,
  OrderView,
} from './operations/repository.js';
import { OperationsService } from './operations/service.js';
import { InMemorySmsRepository } from './sms/memory-repository.js';
import { normalizeNigerianPhone } from './sms/phone.js';
import { adaptProviderPayload } from './sms/provider.js';
import type { SmsRepository } from './sms/repository.js';
import { SmsService } from './sms/service.js';
import { ScenarioLabService } from './scenarios/service.js';

export interface BuildAppOptions {
  logger?: boolean;
  repository?: SmsRepository & OperationsRepository;
  webhookSecret?: string;
  proofSecret?: string;
  scenarioControlSecret?: string;
}

export function buildApp(options: BuildAppOptions = {}): FastifyInstance {
  const app = Fastify({ logger: options.logger ?? false });
  const repository = options.repository ?? new InMemorySmsRepository();
  const sms = new SmsService(repository);
  const operations = new OperationsService(
    repository,
    new MockDispatchAdapter(),
    options.proofSecret ?? 'demo-only-proof-secret-change-me-32',
  );
  const scenarios = new ScenarioLabService();
  const appActions = new AppService(repository, operations);

  const authorizeScenarioControl = (request: {
    headers: Record<string, unknown>;
  }) =>
    !options.scenarioControlSecret ||
    request.headers['x-demo-control-secret'] === options.scenarioControlSecret;

  app.get('/health', () =>
    healthResponseSchema.parse({
      service: 'supplai-api',
      status: 'ok',
      timestamp: new Date().toISOString(),
    }),
  );

  app.post('/demo/sms', async (request, reply) => {
    const input = demoSmsRequestSchema.parse(request.body);
    const now = new Date();
    const result = await sms.process({
      provider: 'demo',
      providerMessageId:
        input.providerMessageId ??
        `demo-${now.getTime()}-${Math.random().toString(36).slice(2)}`,
      from: normalizeNigerianPhone(input.from),
      body: input.body,
      receivedAt: now.toISOString(),
    });
    return reply.code(result.duplicate ? 200 : 201).send(result);
  });

  app.post('/webhooks/sms/:provider', async (request, reply) => {
    if (
      options.webhookSecret &&
      request.headers['x-webhook-secret'] !== options.webhookSecret
    ) {
      return reply.code(401).send({ error: 'Unauthorized webhook' });
    }
    const { provider } = request.params as { provider: string };
    return reply
      .code(200)
      .send(await sms.process(adaptProviderPayload(provider, request.body)));
  });

  app.post('/demo/dispatch', async (request, reply) => {
    const input = createDemoDispatchSchema.parse(request.body);
    const result = await operations.dispatchConfirmed(input.requestReference);
    request.log.info(
      {
        requestReference: input.requestReference,
        transferReference: result?.transferReference,
      },
      'dispatch attempted',
    );
    return result
      ? reply.code(201).send(result)
      : reply
          .code(409)
          .send({ error: 'Request is not confirmed or already dispatched' });
  });

  app.post('/demo/delivery/:reference', async (request, reply) => {
    const { reference } = request.params as { reference: string };
    const input = verifyDeliverySchema.parse(request.body);
    const result = await operations.verifyDelivery(
      reference,
      input.code,
      input.verifierPhone,
    );
    request.log.info(
      { transferReference: reference, result: result.status },
      'delivery proof checked',
    );
    return reply.code(result.status === 'delivered' ? 200 : 409).send(result);
  });

  app.get('/api/overview', () => repository.getOverview(new Date()));
  app.get('/api/lga/overview', () => repository.getOverview(new Date()));
  app.get(
    '/api/lga/transfers',
    async () => (await repository.getOverview(new Date())).transfers,
  );
  app.get('/api/transfers/:reference', async (request, reply) => {
    const { reference } = request.params as { reference: string };
    const transfer = await repository.getTransfer(reference);
    return transfer ?? reply.code(404).send({ error: 'Transfer not found' });
  });
  app.get('/api/orders/:reference', async (request, reply) => {
    const { reference } = request.params as { reference: string };
    const order = await repository.getOrderDetail(reference);
    return order ?? reply.code(404).send({ error: 'Order not found' });
  });
  app.post('/api/requests', async (request, reply) => {
    const input = createAppRequestSchema.parse(request.body);
    const result = await appActions.createRequest(input);
    return reply.code(result.status === 'offered' ? 201 : 409).send(result);
  });
  app.post('/api/orders/:reference/actions', async (request, reply) => {
    const { reference } = request.params as { reference: string };
    const action = orderActionSchema.parse(request.body);
    const result = await appActions.act(reference, action);
    return reply.code(result.accepted ? 200 : 409).send(result);
  });
  app.get('/api/notifications', async (request, reply) => {
    const query = request.query as {
      role?: string;
      facilityId?: string;
      riderName?: string;
    };
    if (
      query.role !== 'facility' &&
      query.role !== 'rider' &&
      query.role !== 'lga'
    )
      return reply
        .code(400)
        .send({ error: 'role must be facility, rider, or lga' });
    if (query.role === 'facility' && !query.facilityId)
      return reply.code(400).send({ error: 'facilityId is required' });
    const view: OrderView = {
      role: query.role,
      ...(query.facilityId ? { facilityId: query.facilityId } : {}),
      ...(query.riderName ? { riderName: query.riderName } : {}),
    };
    return appActions.inbox(view);
  });
  app.get('/api/failures', () => repository.getFailures(new Date()));
  app.get('/api/operations/failures', () => repository.getFailures(new Date()));
  app.post('/api/demo/reset', async (request, reply) => {
    if (!authorizeScenarioControl(request))
      return reply.code(401).send({ error: 'Unauthorized demo control' });
    if (typeof repository.reset === 'function') {
      repository.reset();
    }
    scenarios.resetAll();
    return reply.code(200).send({
      ok: true,
      timestamp: new Date().toISOString(),
      message: 'Demo environment reset to baseline',
    });
  });

  app.get('/demo/scenarios', (request, reply) =>
    authorizeScenarioControl(request)
      ? scenarios.listScenarios()
      : reply.code(401).send({ error: 'Unauthorized demo control' }),
  );

  app.get('/demo/scenarios/:id', (request, reply) => {
    if (!authorizeScenarioControl(request))
      return reply.code(401).send({ error: 'Unauthorized demo control' });
    const { id } = request.params as { id: string };
    const parsedId = scenarioIdSchema.safeParse(id);
    if (!parsedId.success) {
      return reply.code(404).send({ error: `Unknown scenario: ${id}` });
    }
    return scenarios.read(parsedId.data);
  });

  for (const action of ['start', 'tick', 'replay', 'reset'] as const) {
    app.post(`/demo/scenarios/:id/${action}`, (request, reply) => {
      if (!authorizeScenarioControl(request))
        return reply.code(401).send({ error: 'Unauthorized demo control' });
      const { id } = request.params as { id: string };
      const parsedId = scenarioIdSchema.safeParse(id);
      if (!parsedId.success) {
        return reply.code(404).send({ error: `Unknown scenario: ${id}` });
      }
      return scenarios[action](parsedId.data);
    });
  }

  // Backwards compatibility for single-scenario endpoints
  app.get('/demo/scenarios/authorised-ambient-transfer', (request, reply) =>
    authorizeScenarioControl(request)
      ? scenarios.read('authorised-ambient-transfer')
      : reply.code(401).send({ error: 'Unauthorized demo control' }),
  );
  for (const action of ['start', 'tick', 'replay', 'reset'] as const) {
    app.post(
      `/demo/scenarios/authorised-ambient-transfer/${action}`,
      (request, reply) => {
        if (!authorizeScenarioControl(request))
          return reply.code(401).send({ error: 'Unauthorized demo control' });
        return scenarios[action]('authorised-ambient-transfer');
      },
    );
  }

  return app;
}

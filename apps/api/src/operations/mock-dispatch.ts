import { randomUUID } from 'node:crypto';

import { dispatchResultSchema, type DispatchAdapter } from '@supplai/contracts';

export class MockDispatchAdapter implements DispatchAdapter {
  createDispatch() {
    return Promise.resolve(
      dispatchResultSchema.parse({
        externalId: `MOCK-${randomUUID().slice(0, 8).toUpperCase()}`,
        status: 'assigned',
      }),
    );
  }
}

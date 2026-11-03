import {
  deliveryResultSchema,
  demoDispatchResultSchema,
  type DispatchAdapter,
} from '@supplai/contracts';

import { generateProofCode, hashProofCode } from './proof.js';
import type { OperationsRepository } from './repository.js';

export class OperationsService {
  constructor(
    private readonly repository: OperationsRepository,
    private readonly dispatch: DispatchAdapter,
    private readonly proofSecret: string,
  ) {}

  async dispatchConfirmed(requestReference: string, now = new Date()) {
    const code = generateProofCode();
    const proofExpiresAt = new Date(now.getTime() + 30 * 60_000);
    const proofHash = hashProofCode(code, this.proofSecret);
    const candidate = await this.repository.prepareDispatch({
      requestReference,
      proofHash,
      proofExpiresAt,
      now,
    });
    if (!candidate) return null;
    const external = await this.dispatch.createDispatch({
      transferId: candidate.transferId,
      pickupFacilityId: candidate.pickupFacilityId,
      deliveryFacilityId: candidate.deliveryFacilityId,
      quantity: candidate.quantity,
    });
    await this.repository.markDispatched({
      transferReference: candidate.transferReference,
      externalDispatchId: external.externalId,
      now,
    });
    return demoDispatchResultSchema.parse({
      transferReference: candidate.transferReference,
      externalDispatchId: external.externalId,
      receiverProofCode: code,
      proofExpiresAt: proofExpiresAt.toISOString(),
    });
  }

  async verifyDelivery(
    transferReference: string,
    code: string,
    verifierPhone: string,
    now = new Date(),
  ) {
    return deliveryResultSchema.parse(
      await this.repository.verifyDelivery({
        transferReference,
        proofHash: hashProofCode(code, this.proofSecret),
        verifierPhone,
        now,
      }),
    );
  }
}

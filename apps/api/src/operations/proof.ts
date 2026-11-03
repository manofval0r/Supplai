import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';

export function generateProofCode(): string {
  return randomInt(0, 10_000).toString().padStart(4, '0');
}

export function hashProofCode(code: string, secret: string): string {
  return createHmac('sha256', secret).update(code).digest('hex');
}

export function proofHashesEqual(left: string, right: string): boolean {
  const a = Buffer.from(left, 'hex');
  const b = Buffer.from(right, 'hex');
  return a.length === b.length && timingSafeEqual(a, b);
}

import type { OperationalFailure, TransferSummary } from '@supplai/contracts';

export const requestStatuses = [
  'open',
  'matched',
  'confirmed',
  'dispatched',
  'delivered',
  'failed',
  'expired',
] as const;

export const transferStatuses = [
  'pending',
  'dispatched',
  'in_transit',
  'delivered',
  'failed',
  'locked',
] as const;

export const failureCategories: OperationalFailure['category'][] = [
  'unmatched',
  'expired',
  'dispatch',
  'proof_locked',
];

export function transferStatusLabel(status: TransferSummary['status']) {
  return status;
}

export function failureCategoryLabel(category: OperationalFailure['category']) {
  return category;
}

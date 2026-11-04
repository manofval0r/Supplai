import { describe, expect, it } from 'vitest';

import {
  failureCategories,
  requestStatuses,
  transferStatuses,
  transferStatusLabel,
} from '../src/lib/statusLabels.js';

describe('shared workflow labels', () => {
  it('maps every shared request and transfer state without renaming it', () => {
    expect(requestStatuses).toEqual([
      'open',
      'matched',
      'confirmed',
      'dispatched',
      'delivered',
      'failed',
      'expired',
    ]);
    expect(transferStatuses).toEqual([
      'pending',
      'dispatched',
      'in_transit',
      'delivered',
      'failed',
      'locked',
    ]);
    expect(
      transferStatuses.every(
        (status) => transferStatusLabel(status) === status,
      ),
    ).toBe(true);
  });

  it('covers every shared operational failure kind', () => {
    expect(failureCategories).toEqual([
      'unmatched',
      'expired',
      'dispatch',
      'proof_locked',
    ]);
  });
});

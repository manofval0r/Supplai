import {
  lgaOverviewSchema,
  operationalFailureSchema,
  notificationFeedSchema,
  transferSummarySchema,
  resolveSupplaiAssistantQuery,
  type LgaOverview,
  type OperationalFailure,
  type TransferSummary,
  type NotificationEvent,
  type ChatCategory,
  type ChatContextCard,
} from '@supplai/contracts';
import { fixtureOverview, fixtureFailures } from './fixtures';

const API_BASE_URL =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_BASE_URL) ||
  (typeof window !== 'undefined' &&
    (window as unknown as { __SUPPLAI_API__?: string }).__SUPPLAI_API__) ||
  'http://localhost:3000';

export interface LiveDashboardData {
  overview: LgaOverview;
  failures: OperationalFailure[];
  notifications: NotificationEvent[];
}

async function getJson<T>(
  paths: string[],
  parse: (value: unknown) => T,
  signal: AbortSignal,
): Promise<T> {
  let lastError: Error | null = null;
  for (const path of paths) {
    try {
      const response = await fetch(`${API_BASE_URL}${path}`, {
        signal,
        headers: { Accept: 'application/json' },
      });
      if (response.ok) {
        return parse(await response.json());
      }
      lastError = new Error(`API returned ${response.status} for ${path}.`);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }
  throw lastError ?? new Error(`All endpoints failed: ${paths.join(', ')}`);
}

/**
 * Loads overview, failures, and notification events with automatic endpoint fallback
 * and fixture degradation for reliable demo & offline operation.
 */
export async function loadLiveDashboard(
  signal: AbortSignal,
): Promise<LiveDashboardData> {
  try {
    const [overview, failures, notifications] = await Promise.all([
      getJson(
        ['/api/lga/overview', '/api/overview'],
        (v) => lgaOverviewSchema.parse(v),
        signal,
      ),
      getJson(
        ['/api/operations/failures', '/api/failures'],
        (v) => operationalFailureSchema.array().parse(v),
        signal,
      ),
      getJson(
        ['/api/notifications?role=lga'],
        (v) => notificationFeedSchema.parse(v).events,
        signal,
      ).catch(() => [] as NotificationEvent[]),
    ]);
    return { overview, failures, notifications };
  } catch {
    // Graceful offline fixture fallback
    return {
      overview: fixtureOverview,
      failures: fixtureFailures,
      notifications: [],
    };
  }
}

/**
 * Loads active peer transfers from the LGA overview.
 */
export async function loadLiveTransfers(
  signal: AbortSignal,
): Promise<TransferSummary[]> {
  try {
    return await getJson(
      ['/api/lga/transfers', '/api/transfers'],
      (v) => transferSummarySchema.array().parse(v),
      signal,
    );
  } catch {
    return fixtureOverview.transfers;
  }
}

/**
 * Deterministic query resolution for the Supplai Assistant.
 */
export function querySupplaiAssistant(query: string): {
  reply: string;
  category: ChatCategory;
  contextCard?: ChatContextCard;
} {
  return resolveSupplaiAssistantQuery(query);
}

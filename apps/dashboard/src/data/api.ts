import {
  lgaOverviewSchema,
  operationalFailureSchema,
  type LgaOverview,
  type OperationalFailure,
} from '@supplai/contracts';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

export interface LiveDashboardData {
  overview: LgaOverview;
  failures: OperationalFailure[];
}

async function getJson<T>(
  path: string,
  parse: (value: unknown) => T,
  signal: AbortSignal,
) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    signal,
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`Live API returned ${response.status} for ${path}.`);
  }
  return parse(await response.json());
}

export async function loadLiveDashboard(
  signal: AbortSignal,
): Promise<LiveDashboardData> {
  const [overview, failures] = await Promise.all([
    getJson('/api/overview', (value) => lgaOverviewSchema.parse(value), signal),
    getJson(
      '/api/failures',
      (value) => operationalFailureSchema.array().parse(value),
      signal,
    ),
  ]);
  return { overview, failures };
}

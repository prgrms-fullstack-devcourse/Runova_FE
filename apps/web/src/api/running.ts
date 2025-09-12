import api from '@/lib/api';

export type RunningRecordItem = {
  id: string;
  imageUrl?: string;
  title?: string;
  date?: string;
};

export type RunningDashboardRes = {
  nRecords: number;
  totalDistance: number;
  totalDuration: number;
  totalCalories: number;
  meanPace: number;
};

export type RunningDashboardQuery = {
  since?: string;
  until?: string;
};

export async function fetchRunningRecords(cursor?: string) {
  const { data } = await api.get<{ results: RunningRecordItem[] }>(
    '/api/running/records',
    { params: cursor ? { cursor } : undefined },
  );

  const results = data?.results ?? [];
  const nextCursor = results.length > 0 ? results[results.length - 1].id : null;

  return { results, nextCursor };
}

export async function getRunningDashboard(
  query: RunningDashboardQuery = {},
): Promise<RunningDashboardRes> {
  const q: string[] = [];
  if (query.since) q.push(`since=${encodeURIComponent(query.since)}`);
  if (query.until) q.push(`until=${encodeURIComponent(query.until)}`);
  const qs = q.length ? `?${q.join('&')}` : '';
  const { data } = await api.get<RunningDashboardRes>(
    `/api/running/dashboards${qs}`,
  );
  return data;
}

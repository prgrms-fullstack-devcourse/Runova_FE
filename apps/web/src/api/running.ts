import api from '@/lib/api';

export type RunningRecordItem = {
  id: string;
  imageUrl?: string;
  title?: string;
  date?: string;
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

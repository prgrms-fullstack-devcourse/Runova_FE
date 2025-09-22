import api from '@/lib/api';

export type RunningArtResponse = {
  results: string[];
};

export async function fetchRunningArt(): Promise<string[]> {
  const { data } = await api.get<RunningArtResponse>('/api/running/art');
  return data?.results ?? [];
}

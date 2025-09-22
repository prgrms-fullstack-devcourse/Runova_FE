export interface RunningRecord {
  id: number;
  artUrl: string;
  imageUrl: string;
}

export interface RunningRecordDetail {
  id: number;
  artUrl: string;
  imageUrl: string;
  distance: number;
  startAt: string;
  endAt: string;
  duration: number;
  pace: number;
  calories: number;
  course?: {
    id: number;
    title: string;
  };
}

export interface RunningRecordsResponse {
  results: RunningRecord[];
  nextCursor: {
    id: number;
  };
}

export interface RunningRecordsRequest {
  since?: string;
  until?: string;
  cursor?: { id: number } | null;
  limit?: number;
}

export interface RunningDashboard {
  nRecords: number;
  totalDistance: number;
  totalDuration: number;
  totalCalories: number;
  meanPace: number;
}

export interface RunningDashboardRequest {
  since?: string;
  until?: string;
}

export type TimeRange = 'week' | 'month' | 'year' | 'all';

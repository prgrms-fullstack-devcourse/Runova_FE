export interface RunningRecordRequest {
  path: [number, number][];
  startAt: Date;
  endAt: Date;
  pace: number;
  calories: number;
  imageUrl?: string;
}

export interface RunningRecordResponse {
  id: number;
  path: [number, number][];
  startAt: string;
  endAt: string;
  pace: number;
  calories: number;
  createdAt: string;
}

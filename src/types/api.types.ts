export interface ApiErrorResponse {
  message?: string;
  error?: string | object;
  statusCode?: number;
}

export interface AxiosErrorResponse {
  data?: ApiErrorResponse;
  status?: number;
  statusText?: string;
}

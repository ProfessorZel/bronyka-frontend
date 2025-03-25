import { RawAxiosRequestHeaders } from "axios";

export interface ResponseApiUnprocessableEntity {
  detail: {
    loc?: string[];
    msg?: string;
    type?: string;
  }[];
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
}

// Request configuration interface with more HTTP options
export interface RequestConfig {
  headers?: RawAxiosRequestHeaders;
  params?: Record<string, any>;
  timeout?: number;
  withCredentials?: boolean;
}

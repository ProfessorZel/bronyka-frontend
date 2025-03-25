import { useSessionToken } from "@/features/auth";
import axios, {
  AxiosError,
  AxiosResponse,
  RawAxiosRequestHeaders,
} from "axios";
import { ApiResponse, RequestConfig } from "./types";

const baseUrl = import.meta.env.VITE_BASE_URL;

const apiClient = axios.create({
  baseURL: baseUrl,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export function useApi() {
  const token = useSessionToken();

  const defaultHeaders: RawAxiosRequestHeaders = {
    Authorization: token ? `Bearer ${token}` : undefined,
    "Content-Type": "application/json",
  };

  function handleResponse<T>(response: AxiosResponse<T>): ApiResponse<T> {
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
    };
  }

  function handleError(error: AxiosError): never {
    const errorResponse = {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      data: error.response?.data,
    };
    throw errorResponse;
  }

  function getUrl(key: string) {
    return `/${key}`;
  }

  return {
    get,
    post,
    patch,
    delete: _delete,
  };

  function get<T>(
    key: string,
    config: RequestConfig = { headers: defaultHeaders }
  ) {
    return apiClient
      .get<T>(getUrl(key), config)
      .then(function (response) {
        return handleResponse<T>(response).data;
      })
      .catch(handleError);
  }

  function post<T>(
    key: string,
    payload: any,
    config: RequestConfig = { headers: defaultHeaders }
  ) {
    return apiClient
      .post<T>(getUrl(key), payload, config)
      .then(function (response) {
        return handleResponse<T>(response);
      })
      .catch(handleError);
  }

  function patch<T>(
    key: string,
    payload: any,
    config: RequestConfig = { headers: defaultHeaders }
  ) {
    return apiClient
      .patch<T>(getUrl(key), payload, config)
      .then(function (response) {
        return handleResponse<T>(response);
      })
      .catch(handleError);
  }

  function _delete<T>(
    key: string,
    config: RequestConfig = { headers: defaultHeaders }
  ) {
    return axios
      .delete(getUrl(key), config)
      .then(function (response) {
        return handleResponse<T>(response);
      })
      .catch(handleError);
  }
}

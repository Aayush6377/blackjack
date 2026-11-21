import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import type { AuthResponse } from "../types/auth";
import { tokenStorage } from "./tokenStorage";

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8080";

export const apiClient = axios.create({
  baseURL: `${BACKEND_URL}/api/v1`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((promise) => {
    if (error || !token) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  failedQueue = [];
}

apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    if (!originalRequest || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    const url = originalRequest.url ?? "";
    if (originalRequest._retry || url.includes("/auth/refresh") || url.includes("/auth/login")) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((newToken) => {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post<AuthResponse>(
        `${BACKEND_URL}/api/v1/auth/refresh`,
        {},
        { withCredentials: true }
      );

      tokenStorage.setAccessToken(data.accessToken);
      if (data.user) {
        tokenStorage.setUser(data.user);
      }

      processQueue(null, data.accessToken);
      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      tokenStorage.clear();
      window.dispatchEvent(new Event("auth:expired"));
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
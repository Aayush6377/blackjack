import { apiClient } from "../lib/apiClient";
import type {
  AuthResponse,
  LoginRequest,
  OtpResponse,
  RegisterRequest,
  ResetPasswordRequest,
  SendOtpRequest,
  VerifyOtpRequest,
} from "../types/auth";

export const authService = {
  async register(payload: RegisterRequest): Promise<OtpResponse> {
    const { data } = await apiClient.post<OtpResponse>("/auth/register", payload);
    return data;
  },

  async resendVerificationOtp(payload: SendOtpRequest): Promise<OtpResponse> {
    const { data } = await apiClient.post<OtpResponse>(
      "/auth/otp/resend-verification",
      payload
    );
    return data;
  },

  async verifyEmailOtp(payload: VerifyOtpRequest): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>(
      "/auth/otp/verify-email",
      payload
    );
    return data;
  },

  async login(payload: LoginRequest): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>("/auth/login", payload);
    return data;
  },

  async refresh(): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>("/auth/refresh");
    return data;
  },

  async forgotPassword(payload: SendOtpRequest): Promise<OtpResponse> {
    const { data } = await apiClient.post<OtpResponse>(
      "/auth/password/forgot",
      payload
    );
    return data;
  },

  async resetPassword(payload: ResetPasswordRequest): Promise<OtpResponse> {
    const { data } = await apiClient.post<OtpResponse>(
      "/auth/password/reset",
      payload
    );
    return data;
  },

  async logout(): Promise<OtpResponse> {
    const { data } = await apiClient.post<OtpResponse>("/auth/logout");
    return data;
  },
};
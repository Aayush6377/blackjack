export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface SendOtpRequest {
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  code: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}

export interface OtpResponse {
  message: string;
}

export interface AuthUser {
  id?: string;
  name?: string;
  email: string;
  avatarUrl: string;
  role?: string;
  emailVerified: boolean;
}

export interface AuthResponse {
  accessToken: string;
  rawRefreshToken?: string;
  user?: AuthUser;
}
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { tokenStorage } from "../lib/tokenStorage";
import { authService } from "../services/authService";
import { walletService } from "../services/walletService";
import type {
  AuthResponse,
  AuthUser,
  LoginRequest,
  OtpResponse,
  RegisterRequest,
  ResetPasswordRequest,
  SendOtpRequest,
  VerifyOtpRequest,
} from "../types/auth";

export interface AuthContextValue {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  walletBalance: number | null;
  isWalletLoading: boolean;
  loginSessionId: string | null;
  refreshWallet: () => Promise<number | null>;
  setWalletBalanceFromSnapshot: (balance: number | null | undefined) => void;
  login: (payload: LoginRequest) => Promise<AuthResponse>;
  register: (payload: RegisterRequest) => Promise<OtpResponse>;
  verifyEmailOtp: (payload: VerifyOtpRequest) => Promise<AuthResponse>;
  resendVerificationOtp: (payload: SendOtpRequest) => Promise<OtpResponse>;
  forgotPassword: (payload: SendOtpRequest) => Promise<OtpResponse>;
  resetPassword: (payload: ResetPasswordRequest) => Promise<OtpResponse>;
  logout: () => Promise<void>;
  applyAuthResponse: (response: AuthResponse) => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

const LOGIN_SESSION_STORAGE_KEY = "bjr_login_session_id";

function createLoginSessionId(): string {
  const id = `ls_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  sessionStorage.setItem(LOGIN_SESSION_STORAGE_KEY, id);
  return id;
}

function getStoredLoginSessionId(): string | null {
  return sessionStorage.getItem(LOGIN_SESSION_STORAGE_KEY);
}

function clearStoredLoginSessionId(): void {
  sessionStorage.removeItem(LOGIN_SESSION_STORAGE_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => tokenStorage.getUser());
  const [accessToken, setAccessToken] = useState<string | null>(() =>
    tokenStorage.getAccessToken()
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [isWalletLoading, setIsWalletLoading] = useState<boolean>(false);
  const [loginSessionId, setLoginSessionId] = useState<string | null>(() => getStoredLoginSessionId());

  const applyAuthResponse = useCallback((response: AuthResponse) => {
      tokenStorage.setAccessToken(response.accessToken);
      setAccessToken(response.accessToken);
      setLoginSessionId(createLoginSessionId());

      if (response.user) {
        tokenStorage.setUser(response.user);
        setUser(response.user);
      }
    }, []);

  const clearSession = useCallback(() => {
    tokenStorage.clear();
    setAccessToken(null);
    setUser(null);
    setWalletBalance(null);
    setLoginSessionId(null);
    clearStoredLoginSessionId();
  }, []);

  const refreshWallet = useCallback(async (): Promise<number | null> => {
    if (!tokenStorage.getAccessToken()) {
      setWalletBalance(null);
      return null;
    }

    setIsWalletLoading(true);
    try {
      const wallet = await walletService.getWallet();
      setWalletBalance(wallet.balance);
      return wallet.balance;
    } catch {
      return null;
    } finally {
      setIsWalletLoading(false);
    }
  }, []);

  const setWalletBalanceFromSnapshot = useCallback(
    (balance: number | null | undefined) => {
      if (typeof balance === "number" && Number.isFinite(balance)) {
        setWalletBalance(balance);
      }
    },
    []
  );

  useEffect(() => {
    let active = true;

    async function bootstrapAuth() {
      const existingToken = tokenStorage.getAccessToken();
      if (!existingToken) {
        if (active) setIsLoading(false);
        return;
      }

      try {
        const refreshed = await authService.refresh();
        if (active) {
          applyAuthResponse(refreshed);
        }
      } catch {
        if (active) {
          clearSession();
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    bootstrapAuth();
    return () => {
      active = false;
    };
  }, [applyAuthResponse, clearSession]);

  useEffect(() => {
    if (!accessToken) {
      setWalletBalance(null);
      return;
    }
    void refreshWallet();
  }, [accessToken, refreshWallet]);

  useEffect(() => {
    const handleExpired = () => {
      clearSession();
      toast.error("Session expired. Please log in again.");
    };

    window.addEventListener("auth:expired", handleExpired);
    return () => window.removeEventListener("auth:expired", handleExpired);
  }, [clearSession]);

  const login = useCallback(
    async (payload: LoginRequest) => {
      const res = await authService.login(payload);
      applyAuthResponse(res);
      setLoginSessionId(createLoginSessionId())
      await refreshWallet();
      toast.success("Welcome back!");
      return res;
    },
    [applyAuthResponse, refreshWallet]
  );

  const register = useCallback(async (payload: RegisterRequest) => {
    const res = await authService.register(payload);
    toast.success(res.message);
    return res;
  }, []);

  const verifyEmailOtp = useCallback(
    async (payload: VerifyOtpRequest) => {
      const res = await authService.verifyEmailOtp(payload);
      applyAuthResponse(res);
      setLoginSessionId(createLoginSessionId())
      await refreshWallet();
      toast.success("Email verified!");
      return res;
    },
    [applyAuthResponse, refreshWallet]
  );

  const resendVerificationOtp = useCallback(async (payload: SendOtpRequest) => {
    const res = await authService.resendVerificationOtp(payload);
    toast.success(res.message);
    return res;
  }, []);

  const forgotPassword = useCallback(async (payload: SendOtpRequest) => {
    const res = await authService.forgotPassword(payload);
    toast.success(res.message);
    return res;
  }, []);

  const resetPassword = useCallback(async (payload: ResetPasswordRequest) => {
    const res = await authService.resetPassword(payload);
    toast.success("Password reset successfully. Please log in.");
    return res;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore network/logout errors during local cleanup
    } finally {
      clearSession();
      toast.success("Logged out");
    }
  }, [clearSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      isAuthenticated: Boolean(accessToken),
      isLoading,
      walletBalance,
      isWalletLoading,
      loginSessionId,
      refreshWallet,
      setWalletBalanceFromSnapshot,
      login,
      register,
      verifyEmailOtp,
      resendVerificationOtp,
      forgotPassword,
      resetPassword,
      logout,
      applyAuthResponse,
    }),
    [
      user,
      accessToken,
      isLoading,
      walletBalance,
      isWalletLoading,
      loginSessionId,
      refreshWallet,
      setWalletBalanceFromSnapshot,
      login,
      register,
      verifyEmailOtp,
      resendVerificationOtp,
      forgotPassword,
      resetPassword,
      logout,
      applyAuthResponse,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
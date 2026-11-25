export interface UserProfileResponse {
  id: string;
  name: string | null;
  email: string;
  profileImageUrl: string | null;
  profileImagePublicId: string | null;
  role: "USER" | "ADMIN" | string;
  emailVerified: boolean;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfilePayload {
  name?: string;
  profileImageUrl?: string | null;
  avatar?: File | null;
  removeImage?: boolean;
}

export interface UpdatePasswordWithOtpPayload {
  code: string;
  newPassword: string;
}

export interface DeleteAccountWithOtpPayload {
  code: string;
}

export interface ProfileMessageResponse {
  message: string;
}
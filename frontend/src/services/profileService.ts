import { apiClient } from "../lib/apiClient";
import type {
  DeleteAccountWithOtpPayload,
  ProfileMessageResponse,
  UpdatePasswordWithOtpPayload,
  UpdateProfilePayload,
  UserProfileResponse,
} from "../types/profile";

const PROFILE_BASE = "/users/me";

export const profileService = {
  async getCurrentProfile(): Promise<UserProfileResponse> {
    const { data } = await apiClient.get<UserProfileResponse>(PROFILE_BASE);
    return data;
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<UserProfileResponse> {
    const hasFile = Boolean(payload.avatar);
    const trimmedUrl = payload.profileImageUrl?.trim() ?? "";
    const hasUrl = Boolean(trimmedUrl);

    if (hasFile && hasUrl) {
      throw new Error("Provide either an uploaded image file or an image URL, not both.");
    }

    const formData = new FormData();

    if (payload.name !== undefined) {
      formData.append("name", payload.name.trim());
    }

    if (payload.removeImage) {
      formData.append("removeImage", "true");
    } else if (hasFile && payload.avatar) {
      formData.append("avatar", payload.avatar);
    } else if (hasUrl) {
      formData.append("profileImageUrl", trimmedUrl);
    }

    const { data } = await apiClient.patch<UserProfileResponse>(PROFILE_BASE, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  },

  async sendPasswordChangeOtp(): Promise<ProfileMessageResponse> {
    const { data } = await apiClient.post<ProfileMessageResponse>(
      `${PROFILE_BASE}/password/otp`
    );
    return data;
  },

  async updatePasswordWithOtp(payload: UpdatePasswordWithOtpPayload): Promise<ProfileMessageResponse> {
    const { data } = await apiClient.post<ProfileMessageResponse>(
      `${PROFILE_BASE}/password`,
      {
        code: payload.code.trim().toUpperCase(),
        newPassword: payload.newPassword,
      }
    );
    return data;
  },

  async sendAccountDeleteOtp(): Promise<ProfileMessageResponse> {
    const { data } = await apiClient.post<ProfileMessageResponse>(
      `${PROFILE_BASE}/delete/otp`
    );
    return data;
  },

  async deleteAccountWithOtp(payload: DeleteAccountWithOtpPayload): Promise<ProfileMessageResponse> {
    const { data } = await apiClient.delete<ProfileMessageResponse>(PROFILE_BASE, {
      data: { code: payload.code.trim().toUpperCase() },
    });
    return data;
  },
};
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { profileService } from "../services/profileService";
import type {
  DeleteAccountWithOtpPayload,
  UpdatePasswordWithOtpPayload,
  UpdateProfilePayload,
} from "../types/profile";


export const PROFILE_QUERY_KEY = ["users", "me"] as const;

export function useCurrentProfile() {
  return useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: () => profileService.getCurrentProfile(),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => profileService.updateProfile(payload),
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(PROFILE_QUERY_KEY, updatedProfile);
      void queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
    },
  });
}

export function useSendPasswordChangeOtp() {
  return useMutation({
    mutationFn: () => profileService.sendPasswordChangeOtp(),
  });
}

export function useUpdatePasswordWithOtp() {
  return useMutation({
    mutationFn: (payload: UpdatePasswordWithOtpPayload) => profileService.updatePasswordWithOtp(payload),
  });
}

export function useSendAccountDeleteOtp() {
  return useMutation({
    mutationFn: () => profileService.sendAccountDeleteOtp(),
  });
}

export function useDeleteAccountWithOtp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: DeleteAccountWithOtpPayload) => profileService.deleteAccountWithOtp(payload),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: PROFILE_QUERY_KEY });
    },
  });
}
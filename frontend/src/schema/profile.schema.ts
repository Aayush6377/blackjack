import { z } from "zod";

const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;

const optionalHttpUrlSchema = z
  .string()
  .trim()
  .refine(
    (val) => {
      if (!val) return true;
      try {
        const parsed = new URL(val);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
      } catch {
        return false;
      }
    },
    { message: "Profile image URL must start with http:// or https://" }
  );

export const updateProfileSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters.")
      .max(100, "Name must be at most 100 characters."),
    imageMode: z.enum(["keep", "url", "file", "remove"]),
    profileImageUrl: optionalHttpUrlSchema.optional(),
    avatar: z
      .instanceof(File)
      .nullable()
      .optional()
      .refine(
        (file) => !file || file.type.startsWith("image/"),
        "Uploaded file must be a valid image."
      )
      .refine(
        (file) => !file || file.size <= MAX_AVATAR_SIZE_BYTES,
        "Image size must be 5 MB or smaller."
      ),
  })
  .superRefine((data, ctx) => {
    if (data.imageMode === "url" && !data.profileImageUrl?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["profileImageUrl"],
        message: "Enter an image URL or switch image mode.",
      });
    }
    if (data.imageMode === "file" && !data.avatar) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["avatar"],
        message: "Select an image file to upload.",
      });
    }
  });

export const updatePasswordWithOtpSchema = z
  .object({
    code: z
      .string()
      .trim()
      .transform((val) => val.toUpperCase())
      .refine((val) => val.length === 6, {
        message: "Verification code must be 6 characters.",
      }),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters.")
      .max(72, "New password must be at most 72 characters."),
    confirmPassword: z.string().min(1, "Please confirm your new password."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export const deleteAccountWithOtpSchema = z.object({
  code: z
    .string()
    .trim()
    .transform((val) => val.toUpperCase())
    .refine((val) => val.length === 6, {
      message: "Deletion code must be 6 characters.",
    }),
  confirmIrreversible: z.boolean().refine((val) => val === true, {
    message: "Please confirm you understand all chips and data will be removed.",
  }),
});

export type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>;
export type UpdatePasswordWithOtpFormValues = z.infer<
  typeof updatePasswordWithOtpSchema
>;
export type DeleteAccountWithOtpFormValues = z.infer<
  typeof deleteAccountWithOtpSchema
>;
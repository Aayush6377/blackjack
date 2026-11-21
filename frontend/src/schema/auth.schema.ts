import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email address is required.")
    .email("Enter a valid email address.")
    .transform((val) => val.toLowerCase()),
  password: z.string().min(1, "Password is required."),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(1, "Username is required.")
      .min(3, "Username must be at least 3 characters."),
    email: z
      .string()
      .trim()
      .min(1, "Email address is required.")
      .email("Enter a valid email address.")
      .transform((val) => val.toLowerCase()),
    password: z
      .string()
      .min(1, "Password is required.")
      .min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const verifyOtpSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email address is required.")
    .email("Enter a valid email address.")
    .transform((val) => val.toLowerCase()),
  code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(
      /^[A-Z0-9]{6}$/,
      "Enter all 6 letters or digits to verify your email."
    ),
});

export type VerifyOtpFormValues = z.infer<typeof verifyOtpSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email address is required.")
    .email("Enter a valid email address.")
    .transform((val) => val.toLowerCase()),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    email: z
      .string()
      .trim()
      .min(1, "Email address is required.")
      .email("Enter a valid email address.")
      .transform((val) => val.toLowerCase()),
    code: z
      .string()
      .trim()
      .toUpperCase()
      .regex(
        /^[A-Z0-9]{6}$/,
        "Enter the 6-character code sent to your email."
      ),
    newPassword: z
      .string()
      .min(1, "New password is required.")
      .min(8, "New password must be at least 8 characters."),
    confirmPassword: z.string().min(1, "Please confirm your new password."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
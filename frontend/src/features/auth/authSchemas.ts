import { z } from 'zod';

/**
 * Validation rules mirrored from the backend Bean Validation constraints so
 * users get instant feedback and the server stays the source of truth.
 */

const email = z
  .string()
  .min(1, 'Email is required')
  .email('Enter a valid email address')
  .max(160, 'Email is too long');

const password = z
  .string()
  .min(8, 'Use at least 8 characters')
  .max(72, 'Password is too long')
  .regex(/[a-z]/, 'Include a lowercase letter')
  .regex(/[A-Z]/, 'Include an uppercase letter')
  .regex(/\d/, 'Include a number');

const phone = z
  .string()
  .regex(/^\+?[0-9\s-]{7,20}$/, 'Enter a valid phone number')
  .optional()
  .or(z.literal(''));

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(2, 'Enter your full name')
      .max(120, 'Name is too long')
      .regex(/^[\p{L}\s.'-]+$/u, 'Use letters only'),
    email,
    phone,
    password,
    confirmPassword: z.string().min(1, 'Confirm your password'),
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: 'Accept the terms to continue' }),
    }),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z
  .object({
    newPassword: password,
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    newPassword: password,
    confirmPassword: z.string().min(1, 'Confirm your new password'),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((values) => values.currentPassword !== values.newPassword, {
    message: 'Choose a password you have not used before',
    path: ['newPassword'],
  });

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

/** 0–4 strength score used by the register form meter. */
export function passwordStrength(value: string): number {
  if (!value) return 0;
  let score = 0;
  if (value.length >= 8) score += 1;
  if (value.length >= 12) score += 1;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 1;
  if (/\d/.test(value) && /[^\w\s]/.test(value)) score += 1;
  return Math.min(score, 4);
}

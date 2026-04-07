import { z } from 'zod';

export const RegistrationSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required").max(100),
  username: z.string().trim().min(3, "Username must be at least 3 characters").max(50),
  email: z.string().trim().email("Invalid email").max(100),
  password: z.string().min(6, "Password must be at least 6 characters").max(100),
});

export const LoginSchema = z.object({
  username: z.string().trim().min(1, "Username is required").max(50),
  password: z.string().min(1, "Password is required").max(100),
});

export const IOUDataSchema = z.object({
  contactId: z.string().trim().min(1),
  iouType: z.enum(['debt', 'receivable']),
  iouAction: z.enum(['create', 'repay']),
  details: z.string().trim().max(500).optional(),
});

export const EntryPayloadSchema = z.object({
  amount: z.number().min(0, "Amount must be 0 or positive"),
  payment_method: z.string().trim().min(1),
  date: z.string().trim().optional(),
  description: z.string().trim().max(1000).optional(),
  iou: IOUDataSchema.optional(),
}).passthrough();

export const PaymentMethodSchema = z.object({
  name: z.string().trim().min(1, "Method name is required").max(50),
  balance: z.number().default(0),
});

export const ContactSchema = z.object({
  name: z.string().trim().min(1, "Contact name is required").max(100),
});

export const ProfileSchema = z.object({
  username: z.string().trim().min(3, "Username must be at least 3 characters").max(50).optional(),
  email: z.string().trim().email("Invalid email").max(100).optional(),
  full_name: z.string().trim().min(1, "Full name cannot be empty").max(100).optional(),
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Confirm password is required"),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

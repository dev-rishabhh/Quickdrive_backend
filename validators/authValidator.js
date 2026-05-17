import  {z} from "zod/v4"

export const registerSchema = z.object({
    name: z
        .string("Please enter a valid string.")
        .min(3, "Please enter at least 3 characters")
        .max(100, "Please enter at max 100 characters"),
    email: z.email("Please enter a valid email"),
    password: z
        .string("Please enter a valid string.")
        .min(4, "Please enter at least 3 characters")
        .max(100, "Please enter at max 100 characters"),
});

export const loginSchema = z.object({
    email: z.email("Please enter a valid email"),
    password: z
        .string("Please enter a valid string.")
        .min(4, "Please enter at least 3 characters")
        .max(100, "Please enter at max 100 characters"),
});

export const otpSchema = z.object({
    email: z.email("Please enter a valid email"),
    otp: z
        .string("Please enter valid OTP")
});

export const nameSchema = z.object({
    name: z.string("Please enter a valid string.")
        .max(100, "Please enter at max 100 characters"),
});

export const emailSchema = z.object({
    email: z.email("Please enter a valid email"),
});


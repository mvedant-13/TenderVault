import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "vendor"], {
    errorMap: () => ({ message: "Select a role" }),
  }),
  companyName: z.string().optional(),
  gstNumber: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const tenderSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  department: z.string().min(2, "Department is required"),
  category: z.string().min(2, "Category is required"),
  budget: z.coerce
    .number({ invalid_type_error: "Budget must be a number" })
    .positive("Budget must be greater than 0"),
  deadline: z.string().refine((val) => new Date(val) > new Date(), {
    message: "Deadline must be a future date",
  }),
});

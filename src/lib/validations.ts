import { z } from "zod";

// ─── Auth ────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["ADMIN", "CDC_CHAIRMAN", "CDC_HEAD", "FACULTY_COORDINATOR", "STUDENT_COORDINATOR"]),
  phone: z.string().optional(),
  department: z.string().optional(),
  year: z.number().int().min(1).max(5).optional(),
});

// ─── Company ─────────────────────────────────────────────

export const createCompanySchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  domain: z.string().optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  linkedin: z.string().url("Invalid LinkedIn URL").optional().or(z.literal("")),
  companyType: z
    .enum(["PRODUCT", "SERVICE", "STARTUP", "MNC", "PSU", "NGO", "CONSULTANCY", "FINTECH", "EDTECH", "HEALTHTECH", "OTHER"])
    .optional(),
  industry: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().default("India"),
  description: z.string().optional(),
  notes: z.string().optional(),
  assignedCoordinatorId: z.string().optional(),
});

export const updateCompanyStatusSchema = z.object({
  companyId: z.string(),
  newStatus: z.enum([
    "LEAD_FOUND", "COLD_OUTREACH_PENDING", "COLD_EMAIL_SENT",
    "FOLLOWUP_PENDING", "FOLLOWUP_DONE", "INTERESTED",
    "PPT_SCHEDULED", "OA_SCHEDULED", "INTERVIEW_SCHEDULED",
    "HIRING_IN_PROGRESS", "OFFER_RELEASED", "REJECTED",
    "NO_RESPONSE", "ON_HOLD", "CLOSED",
  ]),
  notes: z.string().optional(),
});

// ─── Contact ─────────────────────────────────────────────

export const createContactSchema = z.object({
  companyId: z.string(),
  name: z.string().min(1, "Name is required"),
  designation: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  linkedin: z.string().url("Invalid URL").optional().or(z.literal("")),
  isPrimary: z.boolean().default(false),
  notes: z.string().optional(),
});

// ─── Activity ─────────────────────────────────────────────

export const createActivitySchema = z.object({
  companyId: z.string(),
  type: z.enum([
    "EMAIL", "CALL", "WHATSAPP", "LINKEDIN", "MEETING",
    "PPT", "FOLLOWUP", "OA_DISCUSSION", "INTERVIEW_COORDINATION",
    "INTERNAL_DISCUSSION", "NOTE",
  ]),
  summary: z.string().min(1, "Summary is required"),
  notes: z.string().optional(),
  nextAction: z.string().optional(),
  nextFollowUpDate: z.string().optional(),
});

// ─── Follow-up ────────────────────────────────────────────

export const createFollowUpSchema = z.object({
  companyId: z.string(),
  followUpDate: z.string().min(1, "Follow-up date is required"),
  followUpType: z.enum(["EMAIL", "CALL", "WHATSAPP", "MEETING", "OTHER"]).default("EMAIL"),
  subject: z.string().optional(),
  notes: z.string().optional(),
});

// ─── Alumni ──────────────────────────────────────────────

export const createAlumniSchema = z.object({
  name: z.string().min(1, "Name is required"),
  batch: z.coerce.number().int().min(2000).max(2030),
  branch: z.string().min(1, "Branch is required"),
  currentCompany: z.string().optional(),
  designation: z.string().optional(),
  linkedin: z.string().url("Invalid URL").optional().or(z.literal("")),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  city: z.string().optional(),
  willingToHelp: z.boolean().default(false),
  referralCapability: z.boolean().default(false),
  notes: z.string().optional(),
  assignedCoordinatorId: z.string().optional(),
});

export const createAlumniActivitySchema = z.object({
  alumniId: z.string(),
  type: z.enum([
    "EMAIL", "CALL", "WHATSAPP", "LINKEDIN", "MEETING",
    "PPT", "FOLLOWUP", "OA_DISCUSSION", "INTERVIEW_COORDINATION",
    "INTERNAL_DISCUSSION", "NOTE",
  ]),
  summary: z.string().min(1, "Summary is required"),
  notes: z.string().optional(),
  nextAction: z.string().optional(),
  nextFollowUpDate: z.string().optional(),
});

// Types
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyStatusInput = z.infer<typeof updateCompanyStatusSchema>;
export type CreateContactInput = z.infer<typeof createContactSchema>;
export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type CreateFollowUpInput = z.infer<typeof createFollowUpSchema>;
export type CreateAlumniInput = z.infer<typeof createAlumniSchema>;
export type CreateAlumniActivityInput = z.infer<typeof createAlumniActivitySchema>;

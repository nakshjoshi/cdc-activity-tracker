"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import {
  createCompanySchema,
  updateCompanyStatusSchema,
  createContactSchema,
  createActivitySchema,
  createFollowUpSchema,
} from "@/lib/validations";
import { revalidatePath } from "next/cache";
import type { CompanyStatus } from "@prisma/client";
import { z } from "zod";

// ─── Company CRUD ──────────────────────────────────────────

export async function createCompanyAction(data: unknown) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  // Extended schema that also accepts an optional inline POC contact
  const schema = createCompanySchema.extend({
    poc: z.object({
      name: z.string().min(1),
      designation: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      linkedin: z.string().optional(),
    }).optional(),
  });

  const parsed = schema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { poc, ...companyData } = parsed.data;

  const company = await prisma.company.create({
    data: {
      ...companyData,
      createdById: session.userId,
      website: companyData.website || null,
      linkedin: companyData.linkedin || null,
    },
  });

  // Create initial status log
  await prisma.companyStatusLog.create({
    data: {
      companyId: company.id,
      oldStatus: null,
      newStatus: "LEAD_FOUND",
      changedById: session.userId,
      notes: "Company created",
    },
  });

  // Create inline POC contact if provided
  if (poc?.name) {
    await prisma.contact.create({
      data: {
        companyId: company.id,
        name: poc.name,
        designation: poc.designation || null,
        email: poc.email || null,
        phone: poc.phone || null,
        linkedin: poc.linkedin || null,
        isPrimary: true,
      },
    });
  }

  revalidatePath("/dashboard/companies");
  return { success: true, companyId: company.id };
}

// ─── Edit Company ──────────────────────────────────────────

export async function updateCompanyAction(companyId: string, data: unknown) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const parsed = createCompanySchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await prisma.company.update({
    where: { id: companyId },
    data: {
      ...parsed.data,
      website: parsed.data.website || null,
      linkedin: parsed.data.linkedin || null,
    },
  });

  revalidatePath(`/dashboard/companies/${companyId}`);
  revalidatePath("/dashboard/companies");
  return { success: true };
}

// ─── Status transitions ────────────────────────────────────

export async function updateCompanyStatusAction(data: unknown) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const parsed = updateCompanyStatusSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const company = await prisma.company.findUnique({
    where: { id: parsed.data.companyId },
    select: { currentStatus: true },
  });
  if (!company) return { error: "Company not found" };

  await prisma.company.update({
    where: { id: parsed.data.companyId },
    data: { currentStatus: parsed.data.newStatus as CompanyStatus },
  });

  await prisma.companyStatusLog.create({
    data: {
      companyId: parsed.data.companyId,
      oldStatus: company.currentStatus,
      newStatus: parsed.data.newStatus as CompanyStatus,
      changedById: session.userId,
      notes: parsed.data.notes,
    },
  });

  revalidatePath(`/dashboard/companies/${parsed.data.companyId}`);
  revalidatePath("/dashboard/companies");
  return { success: true };
}

export async function deleteCompanyAction(companyId: string) {
  const session = await getSession();
  if (!session || !["ADMIN", "CDC_HEAD"].includes(session.role)) {
    return { error: "Unauthorized" };
  }

  await prisma.company.update({
    where: { id: companyId },
    data: { isDeleted: true, deletedAt: new Date() },
  });

  revalidatePath("/dashboard/companies");
  return { success: true };
}

export async function getCoordinatorsAction() {
  const session = await getSession();
  if (!session) return { error: "Unauthorized", users: [] };

  const users = await prisma.user.findMany({
    where: { isActive: true },
    select: { id: true, name: true, role: true },
    orderBy: { name: "asc" },
  });

  return { users };
}

export async function assignCoordinatorAction(
  companyId: string,
  coordinatorId: string | null
) {
  const session = await getSession();
  if (!session || !["ADMIN", "CDC_HEAD"].includes(session.role)) {
    return { error: "Unauthorized" };
  }

  await prisma.company.update({
    where: { id: companyId },
    data: { assignedCoordinatorId: coordinatorId },
  });

  revalidatePath(`/dashboard/companies/${companyId}`);
  revalidatePath("/dashboard/companies");
  return { success: true };
}

// ─── Contact Actions ───────────────────────────────────────

export async function createContactAction(data: unknown) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const parsed = createContactSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  if (parsed.data.isPrimary) {
    await prisma.contact.updateMany({
      where: { companyId: parsed.data.companyId },
      data: { isPrimary: false },
    });
  }

  const contact = await prisma.contact.create({
    data: {
      ...parsed.data,
      email: parsed.data.email || null,
      linkedin: parsed.data.linkedin || null,
    },
  });

  revalidatePath(`/dashboard/companies/${parsed.data.companyId}`);
  return { success: true, contactId: contact.id };
}

export async function updateContactAction(
  contactId: string,
  companyId: string,
  data: unknown
) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const parsed = createContactSchema.omit({ companyId: true }).safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  if (parsed.data.isPrimary) {
    await prisma.contact.updateMany({
      where: { companyId },
      data: { isPrimary: false },
    });
  }

  await prisma.contact.update({
    where: { id: contactId },
    data: {
      ...parsed.data,
      email: parsed.data.email || null,
      linkedin: parsed.data.linkedin || null,
    },
  });

  revalidatePath(`/dashboard/companies/${companyId}`);
  return { success: true };
}

export async function deleteContactAction(
  contactId: string,
  companyId: string
) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  await prisma.contact.delete({ where: { id: contactId } });
  revalidatePath(`/dashboard/companies/${companyId}`);
  return { success: true };
}

// ─── Activity Actions ──────────────────────────────────────

export async function createActivityAction(data: unknown) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const parsed = createActivitySchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await prisma.activity.create({
    data: {
      companyId: parsed.data.companyId,
      type: parsed.data.type,
      summary: parsed.data.summary,
      notes: parsed.data.notes,
      nextAction: parsed.data.nextAction,
      nextFollowUpDate: parsed.data.nextFollowUpDate
        ? new Date(parsed.data.nextFollowUpDate)
        : null,
      createdById: session.userId,
    },
  });

  if (parsed.data.nextFollowUpDate) {
    await prisma.followUp.create({
      data: {
        companyId: parsed.data.companyId,
        followUpDate: new Date(parsed.data.nextFollowUpDate),
        followUpType: "EMAIL",
        subject: `Follow-up: ${parsed.data.summary}`,
        createdById: session.userId,
      },
    });
  }

  revalidatePath(`/dashboard/companies/${parsed.data.companyId}`);
  return { success: true };
}

// ─── Follow-up Actions ─────────────────────────────────────

export async function createFollowUpAction(data: unknown) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const parsed = createFollowUpSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await prisma.followUp.create({
    data: {
      companyId: parsed.data.companyId,
      followUpDate: new Date(parsed.data.followUpDate),
      followUpType: parsed.data.followUpType,
      subject: parsed.data.subject,
      notes: parsed.data.notes,
      createdById: session.userId,
    },
  });

  revalidatePath(`/dashboard/companies/${parsed.data.companyId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function completeFollowUpAction(followUpId: string) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  await prisma.followUp.update({
    where: { id: followUpId },
    data: { status: "COMPLETED", completedAt: new Date() },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/followups");
  return { success: true };
}

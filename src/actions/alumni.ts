"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createAlumniSchema, createAlumniActivitySchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import type { AlumniStatus } from "@prisma/client";

export async function createAlumniAction(data: unknown) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const parsed = createAlumniSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const alumni = await prisma.alumni.create({
    data: {
      ...parsed.data,
      email: parsed.data.email || null,
      linkedin: parsed.data.linkedin || null,
    },
  });

  revalidatePath("/dashboard/alumni");
  return { success: true, alumniId: alumni.id };
}

export async function updateAlumniStatusAction(
  alumniId: string,
  newStatus: AlumniStatus
) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  await prisma.alumni.update({
    where: { id: alumniId },
    data: { currentStatus: newStatus },
  });

  revalidatePath(`/dashboard/alumni/${alumniId}`);
  return { success: true };
}

export async function createAlumniActivityAction(data: unknown) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const parsed = createAlumniActivitySchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await prisma.alumniActivity.create({
    data: {
      alumniId: parsed.data.alumniId,
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

  revalidatePath(`/dashboard/alumni/${parsed.data.alumniId}`);
  return { success: true };
}

export async function deleteAlumniAction(alumniId: string) {
  const session = await getSession();
  if (!session || !["ADMIN", "CDC_HEAD"].includes(session.role)) {
    return { error: "Unauthorized" };
  }

  await prisma.alumni.update({
    where: { id: alumniId },
    data: { isDeleted: true, deletedAt: new Date() },
  });

  revalidatePath("/dashboard/alumni");
  return { success: true };
}

export async function updateAlumniAction(alumniId: string, data: unknown) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const parsed = createAlumniSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await prisma.alumni.update({
    where: { id: alumniId },
    data: {
      ...parsed.data,
      email: parsed.data.email || null,
      linkedin: parsed.data.linkedin || null,
    },
  });

  revalidatePath(`/dashboard/alumni/${alumniId}`);
  revalidatePath("/dashboard/alumni");
  return { success: true };
}

export async function assignAlumniCoordinatorAction(
  alumniId: string,
  coordinatorId: string | null
) {
  const session = await getSession();
  if (!session || !["ADMIN", "CDC_HEAD"].includes(session.role)) {
    return { error: "Unauthorized" };
  }

  await prisma.alumni.update({
    where: { id: alumniId },
    data: { assignedCoordinatorId: coordinatorId },
  });

  revalidatePath(`/dashboard/alumni/${alumniId}`);
  revalidatePath("/dashboard/alumni");
  return { success: true };
}

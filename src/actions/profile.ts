"use server";

import { prisma } from "@/lib/prisma";
import { getSession, hashPassword } from "@/lib/auth";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export async function changePasswordAction(data: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}) {
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };

  const parsed = changePasswordSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  // Fetch current hashed password
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { password: true },
  });
  if (!user) return { error: "User not found" };

  // Verify current password
  const bcrypt = await import("bcryptjs");
  const valid = await bcrypt.compare(parsed.data.currentPassword, user.password);
  if (!valid) return { error: "Current password is incorrect" };

  // Hash and save new password
  const hashed = await hashPassword(parsed.data.newPassword);
  await prisma.user.update({
    where: { id: session.userId },
    data: { password: hashed, updatedAt: new Date() },
  });

  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function updateProfileAction(data: {
  name: string;
  phone?: string;
}) {
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };

  if (!data.name?.trim()) return { error: "Name is required" };

  await prisma.user.update({
    where: { id: session.userId },
    data: { name: data.name.trim(), phone: data.phone ?? null },
  });

  revalidatePath("/dashboard/settings");
  return { success: true };
}

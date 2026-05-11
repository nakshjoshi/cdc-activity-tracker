"use server";

import { prisma } from "@/lib/prisma";
import { login as authLogin, clearSession, hashPassword, getSession } from "@/lib/auth";
import { loginSchema, createUserSchema } from "@/lib/validations";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function loginAction(formData: FormData) {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const result = await authLogin(parsed.data.email, parsed.data.password);
  if (result.error) return { error: result.error };

  redirect("/dashboard");
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}

export async function createUserAction(data: {
  name: string;
  email: string;
  password: string;
  role: string;
  phone?: string;
  department?: string;
  year?: number;
}) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  const parsed = createUserSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return { error: "Email already in use" };

  const hashed = await hashPassword(parsed.data.password);
  const user = await prisma.user.create({
    data: {
      ...parsed.data,
      password: hashed,
    },
  });

  revalidatePath("/dashboard/users");
  return { success: true, userId: user.id };
}

export async function toggleUserActiveAction(userId: string) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { error: "Unauthorized" };

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { error: "User not found" };

  await prisma.user.update({
    where: { id: userId },
    data: { isActive: !user.isActive },
  });

  revalidatePath("/dashboard/users");
  return { success: true };
}

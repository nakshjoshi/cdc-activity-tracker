import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import type { Role } from "@prisma/client";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "fallback-secret-change-me"
);
const COOKIE_NAME = "tnp_session";

export interface SessionPayload {
  userId: string;
  email: string;
  role: Role;
  name: string;
}

// ─── Token helpers ────────────────────────────────────────

export async function signToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

// ─── Session helpers ──────────────────────────────────────

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function setSession(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// ─── Auth actions ─────────────────────────────────────────

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) return { error: "Invalid credentials" };

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return { error: "Invalid credentials" };

  const token = await signToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });

  await setSession(token);
  return { success: true, user };
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

// ─── RBAC guard ───────────────────────────────────────────

export const ROLE_HIERARCHY: Record<Role, number> = {
  ADMIN: 5,
  CDC_CHAIRMAN: 4,
  CDC_HEAD: 3,
  FACULTY_COORDINATOR: 2,
  STUDENT_COORDINATOR: 1,
};

export function hasPermission(userRole: Role, requiredRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

export function canDelete(role: Role): boolean {
  return role === "ADMIN" || role === "CDC_HEAD";
}

export function canApprove(role: Role): boolean {
  return role === "ADMIN" || role === "CDC_CHAIRMAN" || role === "CDC_HEAD";
}

export function canManageUsers(role: Role): boolean {
  return role === "ADMIN";
}

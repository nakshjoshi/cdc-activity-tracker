import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ROLE_CONFIG } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";
import type { Metadata } from "next";
import { ChangePasswordForm } from "./change-password-form";
import { UpdateProfileForm } from "./update-profile-form";
import type { Role } from "@prisma/client";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true, role: true, phone: true, department: true, year: true, createdAt: true },
  });
  if (!user) redirect("/login");

  const roleConfig = ROLE_CONFIG[user.role as Role];

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-zinc-100">
          Settings
        </h1>
        <p className="mt-0.5 text-sm text-zinc-500">
          Manage your profile and account security
        </p>
      </div>

      {/* Profile card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
              {user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
            </div>
            <div>
              <CardTitle>{user.name}</CardTitle>
              <div className="mt-0.5 flex items-center gap-2">
                <p className="text-sm text-zinc-500">{user.email}</p>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${roleConfig.color} ${roleConfig.bg}`}>
                  {roleConfig.label}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <UpdateProfileForm
            defaultName={user.name}
            defaultPhone={user.phone ?? ""}
          />
        </CardContent>
      </Card>

      {/* Change password card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-zinc-500" />
            Change Password
          </CardTitle>
          <p className="text-sm text-zinc-500">
            Use a strong password with at least 8 characters.
          </p>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}

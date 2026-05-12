import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { ROLE_CONFIG, formatDate, getInitials } from "@/lib/utils";
import { UserActions } from "./user-actions";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "User Management" };

export default async function UsersPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const users = await prisma.user.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, email: true, role: true,
      phone: true, department: true, year: true,
      isActive: true, createdAt: true,
      _count: { select: { assignedCompanies: true, assignedAlumni: true } },
    },
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-zinc-100">
            User Management
          </h1>
          <p className="mt-0.5 text-sm text-zinc-500">{users.length} registered users</p>
        </div>
        <UserActions />
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-800">
            <thead>
              <tr className="bg-zinc-800/50">
                {["User", "Role", "Department", "Assigned", "Status", "Joined", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {users.map((user) => {
                const roleConfig = ROLE_CONFIG[user.role];
                return (
                  <tr key={user.id} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-600 text-xs font-bold text-white">
                          {getInitials(user.name)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-zinc-100">{user.name}</p>
                          <p className="text-xs text-zinc-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${roleConfig.color} ${roleConfig.bg}`}>
                        {roleConfig.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-400">
                      {user.department ?? "—"}
                      {user.year ? ` · Y${user.year}` : ""}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 text-xs text-zinc-500">
                        <span>{user._count.assignedCompanies} companies</span>
                        <span>·</span>
                        <span>{user._count.assignedAlumni} alumni</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
                        user.isActive
                          ? "bg-emerald-900/30 text-emerald-400"
                          : "bg-zinc-800 text-zinc-400"
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${user.isActive ? "bg-emerald-950/300" : "bg-zinc-500"}`} />
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-500">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <UserActions userId={user.id} isActive={user.isActive} mode="row" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

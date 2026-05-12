import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import type { Role } from "@prisma/client";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="flex h-screen overflow-hidden bg-[#0C0C0F] p-2 sm:p-3 gap-2 sm:gap-3">
      <Sidebar userRole={session.role as Role} />
      <div className="flex flex-1 flex-col overflow-hidden gap-2 sm:gap-3">
        <div className="relative z-10">
          <Topbar
            user={{
              name: session.name,
              email: session.email,
              role: session.role as Role,
            }}
          />
        </div>
        <main className="flex-1 overflow-y-auto rounded-2xl bg-zinc-900 border border-zinc-800 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}

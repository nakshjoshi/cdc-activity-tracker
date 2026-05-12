import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ALUMNI_STATUS_CONFIG, formatDate, getInitials } from "@/lib/utils";
import { GraduationCap, ExternalLink, Heart, Users } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { AlumniActions } from "./alumni-actions";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Alumni" };

interface SearchParams { search?: string; status?: string; batch?: string; page?: string; }

export default async function AlumniPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await getSession();
  const params = await searchParams;
  const page = parseInt(params.page ?? "1");
  const pageSize = 20;

  const where = {
    isDeleted: false,
    ...(params.status && { currentStatus: params.status as never }),
    ...(params.batch && { batch: parseInt(params.batch) }),
    ...(params.search && {
      OR: [
        { name: { contains: params.search, mode: "insensitive" as const } },
        { currentCompany: { contains: params.search, mode: "insensitive" as const } },
        { branch: { contains: params.search, mode: "insensitive" as const } },
      ],
    }),
  };

  const [alumni, total] = await Promise.all([
    prisma.alumni.findMany({
      where,
      take: pageSize,
      skip: (page - 1) * pageSize,
      orderBy: { updatedAt: "desc" },
      include: {
        assignedCoordinator: { select: { name: true } },
        _count: { select: { activities: true } },
      },
    }),
    prisma.alumni.count({ where }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-zinc-100">
            Alumni Outreach
          </h1>
          <p className="mt-0.5 text-sm text-zinc-500">{total} alumni in database</p>
        </div>
        <AlumniActions session={session} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: "All", value: "" },
          { label: "Not Contacted", value: "NOT_CONTACTED" },
          { label: "Contacted", value: "CONTACTED" },
          { label: "Interested", value: "INTERESTED" },
          { label: "Referred", value: "REFERRED" },
        ].map((f) => (
          <Link
            key={f.value}
            href={`/dashboard/alumni?${f.value ? `status=${f.value}` : ""}`}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              (params.status ?? "") === f.value
                ? "bg-orange-600 text-white"
                : "bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-800">
            <thead>
              <tr className="bg-zinc-800/50">
                {["Alumni", "Batch / Branch", "Current Company", "Status", "Willing", "Activities", "Coordinator"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {alumni.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-sm text-zinc-500">
                    No alumni found. Add the first one!
                  </td>
                </tr>
              ) : (
                alumni.map((a) => {
                  const statusConfig = ALUMNI_STATUS_CONFIG[a.currentStatus];
                  return (
                    <tr key={a.id} className="group hover:bg-zinc-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-xs font-bold text-white">
                            {getInitials(a.name)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-zinc-100">
                              {a.name}
                            </p>
                            {a.email && <p className="text-xs text-zinc-500">{a.email}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-zinc-100">{a.batch}</p>
                        <p className="text-xs text-zinc-500">{a.branch}</p>
                      </td>
                      <td className="px-4 py-3">
                        {a.currentCompany ? (
                          <div>
                            <p className="text-sm text-zinc-100">{a.currentCompany}</p>
                            {a.designation && <p className="text-xs text-zinc-500">{a.designation}</p>}
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-600">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig.color} ${statusConfig.bg}`}>
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {a.willingToHelp ? (
                          <Heart className="h-4 w-4 fill-red-400 text-red-400" />
                        ) : (
                          <span className="text-zinc-600">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="rounded-full bg-orange-900/30 px-2 py-0.5 text-xs font-medium text-orange-400">
                          {a._count.activities}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-500">
                        {a.assignedCoordinator?.name ?? <span className="text-zinc-600">—</span>}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 pb-4">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            baseUrl="/dashboard/alumni"
            searchParams={{ status: params.status, search: params.search, batch: params.batch }}
          />
        </div>
      </Card>
    </div>
  );
}


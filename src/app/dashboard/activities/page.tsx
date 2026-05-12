import { prisma } from "@/lib/prisma";
import { formatRelativeTime, ACTIVITY_CONFIG } from "@/lib/utils";
import { Activity } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Activities" };

interface SearchParams { page?: string; type?: string; }

export default async function ActivitiesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page ?? "1");
  const pageSize = 30;

  const where = params.type ? { type: params.type as never } : {};

  const [activities, total] = await Promise.all([
    prisma.activity.findMany({
      where,
      take: pageSize,
      skip: (page - 1) * pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        company: { select: { id: true, companyName: true } },
        createdBy: { select: { name: true } },
      },
    }),
    prisma.activity.count({ where }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-zinc-100">
          All Activities
        </h1>
        <p className="mt-0.5 text-sm text-zinc-500">{total} total interactions logged</p>
      </div>

      {/* Type filters */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: "All", value: "" },
          { label: "Email", value: "EMAIL" },
          { label: "Call", value: "CALL" },
          { label: "Meeting", value: "MEETING" },
          { label: "WhatsApp", value: "WHATSAPP" },
          { label: "LinkedIn", value: "LINKEDIN" },
          { label: "Follow-up", value: "FOLLOWUP" },
        ].map((f) => (
          <Link
            key={f.value}
            href={`/dashboard/activities?${f.value ? `type=${f.value}` : ""}`}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              (params.type ?? "") === f.value
                ? "bg-blue-600 text-white"
                : "bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="space-y-2">
        {activities.map((activity) => {
          const config = ACTIVITY_CONFIG[activity.type];
          return (
            <Card key={activity.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-800">
                  <span className={`text-xs font-bold ${config.color}`}>
                    {activity.type[0]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <span className={`text-xs font-semibold uppercase tracking-wide ${config.color}`}>
                        {config.label}
                      </span>
                      <p className="mt-0.5 text-sm font-medium text-zinc-100">
                        {activity.summary}
                      </p>
                    </div>
                    <span className="text-xs text-zinc-500 shrink-0">
                      {formatRelativeTime(activity.createdAt)}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-3 flex-wrap">
                    <Link
                      href={`/dashboard/companies/${activity.companyId}`}
                      className="text-xs text-blue-400 hover:underline"
                    >
                      {activity.company.companyName}
                    </Link>
                    <span className="text-xs text-zinc-500">by {activity.createdBy.name}</span>
                    {activity.nextFollowUpDate && (
                      <span className="rounded-full bg-blue-900/30 px-2 py-0.5 text-xs text-blue-400">
                        Follow-up: {new Date(activity.nextFollowUpDate).toLocaleDateString("en-IN")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        baseUrl="/dashboard/activities"
        searchParams={{ type: params.type }}
      />
    </div>
  );
}

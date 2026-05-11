import { prisma } from "@/lib/prisma";
import { formatRelativeTime, ACTIVITY_CONFIG } from "@/lib/utils";
import { Activity } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
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

  return (
    <div className="space-y-5">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-zinc-100">
          <Activity className="h-5 w-5 text-indigo-600" />
          All Activities
        </h1>
        <p className="mt-0.5 text-sm text-gray-500">{total} total interactions logged</p>
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
                ? "bg-indigo-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300"
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
            <Card key={activity.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50 dark:bg-zinc-800">
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
                      <p className="mt-0.5 text-sm font-medium text-gray-900 dark:text-zinc-100">
                        {activity.summary}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">
                      {formatRelativeTime(activity.createdAt)}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-3 flex-wrap">
                    <Link
                      href={`/dashboard/companies/${activity.companyId}`}
                      className="text-xs text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                      {activity.company.companyName}
                    </Link>
                    <span className="text-xs text-gray-400">by {activity.createdBy.name}</span>
                    {activity.nextFollowUpDate && (
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
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
    </div>
  );
}

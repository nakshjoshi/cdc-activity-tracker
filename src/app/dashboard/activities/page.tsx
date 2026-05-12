import { prisma } from "@/lib/prisma";
import { formatRelativeTime, ACTIVITY_CONFIG } from "@/lib/utils";
import { Suspense } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { FilterBar } from "@/components/ui/filter-bar";
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

  // Fetch count fast for header
  const where = params.type ? { type: params.type as never } : {};
  const total = await prisma.activity.count({ where });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-zinc-100">
          All Activities
        </h1>
        <p className="mt-0.5 text-sm text-zinc-500">{total} total interactions logged</p>
      </div>

      {/* Type filters */}
      <FilterBar
        paramKey="type"
        baseUrl="/dashboard/activities"
        options={[
          { label: "All", value: "" },
          { label: "Email", value: "EMAIL" },
          { label: "Call", value: "CALL" },
          { label: "Meeting", value: "MEETING" },
          { label: "WhatsApp", value: "WHATSAPP" },
          { label: "LinkedIn", value: "LINKEDIN" },
          { label: "Follow-up", value: "FOLLOWUP" },
          { label: "TPO Form", value: "TPO_FORM" },
        ]}
      />

      <Suspense fallback={<ActivitiesListSkeleton />}>
        <ActivitiesServerList type={params.type} page={page} pageSize={pageSize} total={total} />
      </Suspense>
    </div>
  );
}

async function ActivitiesServerList({
  type,
  page,
  pageSize,
  total,
}: {
  type?: string;
  page: number;
  pageSize: number;
  total: number;
}) {
  const where = type ? { type: type as never } : {};

  const activities = await prisma.activity.findMany({
    where,
    take: pageSize,
    skip: (page - 1) * pageSize,
    orderBy: { createdAt: "desc" },
    include: {
      company: { select: { id: true, companyName: true } },
      createdBy: { select: { name: true } },
    },
  });

  const totalPages = Math.ceil(total / pageSize);

  return (
    <>
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

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        baseUrl="/dashboard/activities"
        searchParams={{ type }}
      />
    </>
  );
}

function ActivitiesListSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="p-4 animate-pulse">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 bg-zinc-800 rounded-lg shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="h-3 w-16 bg-zinc-800 rounded mb-2" />
                  <div className="h-4 w-48 bg-zinc-800 rounded" />
                </div>
                <div className="h-3 w-16 bg-zinc-800 rounded" />
              </div>
              <div className="flex gap-4">
                <div className="h-3 w-32 bg-zinc-800 rounded" />
                <div className="h-3 w-24 bg-zinc-800 rounded" />
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

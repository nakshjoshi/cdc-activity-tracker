import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { AlertCircle, Clock, Calendar } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { CompleteFollowUpButton } from "./complete-followup-button";

export const metadata: Metadata = { title: "Follow-ups" };

interface SearchParams { tab?: string; page?: string; }

export default async function FollowUpsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const session = await getSession();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + 86400000);
  const in7Days = new Date(today.getTime() + 7 * 86400000);

  const tab = params.tab ?? "overdue";
  const page = parseInt(params.page ?? "1");
  const pageSize = 20;

  // Build filter based on active tab
  const whereMap: Record<string, object> = {
    overdue:  { status: "PENDING", followUpDate: { lt: today } },
    today:    { status: "PENDING", followUpDate: { gte: today, lt: tomorrow } },
    upcoming: { status: "PENDING", followUpDate: { gte: tomorrow, lte: in7Days } },
  };
  const where = whereMap[tab] ?? whereMap.overdue;

  // Parallel: fetch counts for all tabs + paginated results for active tab
  const [overdueCount, todayCount, upcomingCount, followUps, total] = await Promise.all([
    prisma.followUp.count({ where: { status: "PENDING", followUpDate: { lt: today } } }),
    prisma.followUp.count({ where: { status: "PENDING", followUpDate: { gte: today, lt: tomorrow } } }),
    prisma.followUp.count({ where: { status: "PENDING", followUpDate: { gte: tomorrow, lte: in7Days } } }),
    prisma.followUp.findMany({
      where,
      take: pageSize,
      skip: (page - 1) * pageSize,
      include: {
        company: { select: { id: true, companyName: true } },
        createdBy: { select: { name: true } },
      },
      orderBy: { followUpDate: "asc" },
    }),
    prisma.followUp.count({ where }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  const tabs = [
    { key: "overdue", label: "Overdue", count: overdueCount, color: "text-red-400", icon: <AlertCircle className="h-4 w-4" /> },
    { key: "today", label: "Today", count: todayCount, color: "text-orange-400", icon: <Clock className="h-4 w-4" /> },
    { key: "upcoming", label: "Next 7 Days", count: upcomingCount, color: "text-blue-400", icon: <Calendar className="h-4 w-4" /> },
  ];

  const borderColor = tab === "overdue" ? "border-red-900/40" : tab === "today" ? "border-orange-900/40" : "border-zinc-700";

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-zinc-100">Follow-ups</h1>
        <p className="mt-0.5 text-sm text-zinc-500">
          {overdueCount} overdue · {todayCount} today · {upcomingCount} upcoming
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={`/dashboard/followups?tab=${t.key}`}
            className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
              tab === t.key
                ? "bg-blue-600 text-white"
                : "bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700"
            }`}
          >
            {t.icon}
            {t.label}
            <span className="ml-1 rounded-full bg-zinc-700/50 px-1.5 py-0.5 text-[10px] font-bold tabular-nums">
              {t.count}
            </span>
          </Link>
        ))}
      </div>

      {/* Results */}
      {followUps.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-700 p-12 text-center text-sm text-zinc-500">
          No follow-ups in this category
        </div>
      ) : (
        <div className="space-y-2">
          {followUps.map((f) => (
            <Card key={f.id} className={`border ${borderColor} p-4`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={`/dashboard/companies/${f.company.id}`}
                      className="text-sm font-semibold text-zinc-100 hover:text-blue-400 transition-colors"
                    >
                      {f.company.companyName}
                    </Link>
                    <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
                      {f.followUpType}
                    </span>
                  </div>
                  {f.subject && (
                    <p className="mt-0.5 text-sm text-zinc-300">{f.subject}</p>
                  )}
                  <p className="mt-1 text-xs text-zinc-500">
                    {formatDate(f.followUpDate)} · Added by {f.createdBy.name}
                  </p>
                </div>
                <CompleteFollowUpButton followUpId={f.id} />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-zinc-500">Page {page} of {totalPages}</p>
          <div className="flex gap-1">
            {page > 1 && (
              <Link
                href={`/dashboard/followups?tab=${tab}&page=${page - 1}`}
                className="flex h-8 items-center rounded-lg bg-zinc-800 px-3 text-xs text-zinc-300 hover:bg-zinc-700 transition-colors"
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/dashboard/followups?tab=${tab}&page=${page + 1}`}
                className="flex h-8 items-center rounded-lg bg-zinc-800 px-3 text-xs text-zinc-300 hover:bg-zinc-700 transition-colors"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

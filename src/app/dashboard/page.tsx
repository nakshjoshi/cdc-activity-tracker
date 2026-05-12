import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/companies/status-badge";
import { formatRelativeTime, formatDate } from "@/lib/utils";
import {
  Building2, GraduationCap, TrendingUp, Clock,
  AlertCircle, CheckCircle2, Users, Calendar,
  Mail, Phone, MessageCircle, StickyNote
} from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

import { Suspense } from "react";
export default async function DashboardPage() {
  const session = await getSession();

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-zinc-100">
          {greeting}, {session?.name?.split(" ")[0]}
        </h1>
        <p className="mt-0.5 text-sm text-zinc-500">
          Here&apos;s what&apos;s happening with your placement pipeline today.
        </p>
      </div>

      <Suspense fallback={<OverdueFollowupsSkeleton />}>
        <OverdueFollowupsAlert />
      </Suspense>

      {/* Stat cards */}
      <Suspense fallback={<StatCardsSkeleton />}>
        <StatCardsGrid />
      </Suspense>


      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Activities - 2/3 width */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Activities</CardTitle>
                <Link
                  href="/dashboard/activities"
                  className="text-xs text-blue-400 hover:underline"
                >
                  View all
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Suspense fallback={<ListSkeleton count={5} />}>
                <RecentActivitiesList />
              </Suspense>
            </CardContent>
          </Card>
        </div>

        {/* Status breakdown - 1/3 width */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pipeline Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Suspense fallback={<ListSkeleton count={5} />}>
                <PipelineBreakdownList />
              </Suspense>
            </CardContent>
          </Card>

          {/* Recent status changes */}
          <Card>
            <CardHeader>
              <CardTitle>Status Changes</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Suspense fallback={<ListSkeleton count={4} />}>
                <StatusChangesList />
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Async Components for Suspense ───────────────────────────────────────────

async function OverdueFollowupsAlert() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const overdueFollowUps = await prisma.followUp.count({
    where: { status: "PENDING", followUpDate: { lt: today } },
  });

  if (overdueFollowUps === 0) return null;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-red-900/40 bg-red-950/30 p-4">
      <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
      <div>
        <p className="text-sm font-medium text-red-300">
          {overdueFollowUps} overdue follow-up{overdueFollowUps > 1 ? "s" : ""}
        </p>
        <p className="text-xs text-red-400/70">
          These need your immediate attention
        </p>
      </div>
      <Link
        href="/dashboard/followups"
        className="ml-auto text-xs font-medium text-red-400 hover:underline"
      >
        View all →
      </Link>
    </div>
  );
}

function OverdueFollowupsSkeleton() {
  return <div className="h-[74px] rounded-xl bg-zinc-700 animate-pulse" />;
}

async function StatCardsGrid() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + 86400000);
  const in7Days = new Date(today.getTime() + 7 * 86400000);

  const [
    totalCompanies,
    activeCompanies,
    interestedCompanies,
    offerReleased,
    totalAlumni,
    willingAlumni,
    overdueFollowUps,
    todayFollowUps,
    upcomingFollowUps,
  ] = await Promise.all([
    prisma.company.count({ where: { isDeleted: false } }),
    prisma.company.count({
      where: {
        isDeleted: false,
        currentStatus: { notIn: ["REJECTED", "NO_RESPONSE", "ON_HOLD", "CLOSED"] },
      },
    }),
    prisma.company.count({ where: { isDeleted: false, currentStatus: "INTERESTED" } }),
    prisma.company.count({ where: { isDeleted: false, currentStatus: "OFFER_RELEASED" } }),
    prisma.alumni.count({ where: { isDeleted: false } }),
    prisma.alumni.count({ where: { isDeleted: false, willingToHelp: true } }),
    prisma.followUp.count({ where: { status: "PENDING", followUpDate: { lt: today } } }),
    prisma.followUp.count({ where: { status: "PENDING", followUpDate: { gte: today, lt: tomorrow } } }),
    prisma.followUp.count({ where: { status: "PENDING", followUpDate: { gte: tomorrow, lte: in7Days } } }),
  ]);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      <StatCard title="Total Companies" value={totalCompanies} subtitle="in pipeline" icon={<Building2 className="h-5 w-5" />} accentColor="blue" />
      <StatCard title="Active Pipeline" value={activeCompanies} subtitle="ongoing" icon={<TrendingUp className="h-5 w-5" />} accentColor="green" />
      <StatCard title="Interested" value={interestedCompanies} subtitle="confirmed" icon={<CheckCircle2 className="h-5 w-5" />} accentColor="green" />
      <StatCard title="Offers Released" value={offerReleased} subtitle="placed" icon={<CheckCircle2 className="h-5 w-5" />} accentColor="blue" />
      <StatCard title="Alumni" value={totalAlumni} subtitle={`${willingAlumni} willing`} icon={<GraduationCap className="h-5 w-5" />} accentColor="orange" />
      <StatCard title="Overdue" value={overdueFollowUps} subtitle="action needed" icon={<AlertCircle className="h-5 w-5" />} accentColor="red" />
      <StatCard title="Today" value={todayFollowUps} subtitle="follow-ups" icon={<Calendar className="h-5 w-5" />} accentColor="orange" />
      <StatCard title="Next 7 Days" value={upcomingFollowUps} subtitle="upcoming" icon={<Clock className="h-5 w-5" />} accentColor="blue" />
    </div>
  );
}

function StatCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 animate-pulse">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="h-24 rounded-2xl bg-zinc-800" />
      ))}
    </div>
  );
}

async function RecentActivitiesList() {
  const recentActivities = await prisma.activity.findMany({
    take: 8,
    orderBy: { createdAt: "desc" },
    include: {
      company: { select: { companyName: true, id: true } },
      createdBy: { select: { name: true } },
    },
  });

  if (recentActivities.length === 0) {
    return <p className="py-8 text-center text-sm text-zinc-500">No activities yet</p>;
  }

  return (
    <div className="space-y-3">
      {recentActivities.map((activity) => (
        <Link
          key={activity.id}
          href={`/dashboard/companies/${activity.companyId}`}
          className="flex items-start gap-3 rounded-lg p-2 hover:bg-zinc-800/50 transition-colors"
        >
          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-950/30">
            <span className="text-blue-400">
              {activity.type === "EMAIL" ? <Mail className="h-3.5 w-3.5" /> :
               activity.type === "CALL" ? <Phone className="h-3.5 w-3.5" /> :
               activity.type === "MEETING" ? <Users className="h-3.5 w-3.5" /> :
               activity.type === "WHATSAPP" ? <MessageCircle className="h-3.5 w-3.5" /> :
               <StickyNote className="h-3.5 w-3.5" />}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-zinc-100">
              {activity.summary}
            </p>
            <p className="text-xs text-zinc-500">
              {activity.company.companyName} · {activity.createdBy.name}
            </p>
          </div>
          <span className="shrink-0 text-xs text-zinc-500">
            {formatRelativeTime(activity.createdAt)}
          </span>
        </Link>
      ))}
    </div>
  );
}

async function PipelineBreakdownList() {
  const statusBreakdown = await prisma.company.groupBy({
    by: ["currentStatus"],
    where: { isDeleted: false },
    _count: true,
    orderBy: { _count: { currentStatus: "desc" } },
  });

  return (
    <div className="space-y-2">
      {statusBreakdown.slice(0, 8).map((item) => (
        <div key={item.currentStatus} className="flex items-center justify-between">
          <StatusBadge status={item.currentStatus} size="sm" />
          <span className="text-sm font-semibold text-zinc-100">
            {item._count}
          </span>
        </div>
      ))}
    </div>
  );
}

async function StatusChangesList() {
  const recentStatusChanges = await prisma.companyStatusLog.findMany({
    take: 5,
    orderBy: { changedAt: "desc" },
    include: {
      company: { select: { companyName: true, id: true } },
      changedBy: { select: { name: true } },
    },
  });

  return (
    <div className="space-y-3">
      {recentStatusChanges.map((log) => (
        <Link
          key={log.id}
          href={`/dashboard/companies/${log.companyId}`}
          className="block rounded-lg p-2 hover:bg-zinc-800/50 transition-colors"
        >
          <p className="text-sm font-medium text-zinc-100 truncate">
            {log.company.companyName}
          </p>
          <div className="mt-1 flex items-center gap-1.5 flex-wrap">
            {log.oldStatus && <StatusBadge status={log.oldStatus} size="sm" />}
            {log.oldStatus && <span className="text-xs text-zinc-500">→</span>}
            <StatusBadge status={log.newStatus} size="sm" />
          </div>
          <p className="mt-0.5 text-xs text-zinc-500">
            {log.changedBy.name} · {formatRelativeTime(log.changedAt)}
          </p>
        </Link>
      ))}
    </div>
  );
}

function ListSkeleton({ count }: { count: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="h-12 rounded-lg bg-zinc-700" />
      ))}
    </div>
  );
}

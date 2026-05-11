import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/companies/status-badge";
import { formatRelativeTime, formatDate } from "@/lib/utils";
import {
  Building2, GraduationCap, TrendingUp, Clock,
  AlertCircle, CheckCircle2, Users, Calendar,
} from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

async function getDashboardData() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + 86400000);
  const in7Days = new Date(today.getTime() + 7 * 86400000);

  const [
    totalCompanies,
    activeCompanies,
    interestedCompanies,
    noResponseCompanies,
    offerReleased,
    totalAlumni,
    willingAlumni,
    overdueFollowUps,
    todayFollowUps,
    upcomingFollowUps,
    recentActivities,
    recentStatusChanges,
    statusBreakdown,
  ] = await Promise.all([
    prisma.company.count({ where: { isDeleted: false } }),
    prisma.company.count({
      where: {
        isDeleted: false,
        currentStatus: {
          notIn: ["REJECTED", "NO_RESPONSE", "ON_HOLD", "CLOSED"],
        },
      },
    }),
    prisma.company.count({ where: { isDeleted: false, currentStatus: "INTERESTED" } }),
    prisma.company.count({ where: { isDeleted: false, currentStatus: "NO_RESPONSE" } }),
    prisma.company.count({ where: { isDeleted: false, currentStatus: "OFFER_RELEASED" } }),
    prisma.alumni.count({ where: { isDeleted: false } }),
    prisma.alumni.count({ where: { isDeleted: false, willingToHelp: true } }),
    prisma.followUp.count({
      where: { status: "PENDING", followUpDate: { lt: today } },
    }),
    prisma.followUp.count({
      where: { status: "PENDING", followUpDate: { gte: today, lt: tomorrow } },
    }),
    prisma.followUp.count({
      where: { status: "PENDING", followUpDate: { gte: tomorrow, lte: in7Days } },
    }),
    prisma.activity.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        company: { select: { companyName: true, id: true } },
        createdBy: { select: { name: true } },
      },
    }),
    prisma.companyStatusLog.findMany({
      take: 5,
      orderBy: { changedAt: "desc" },
      include: {
        company: { select: { companyName: true, id: true } },
        changedBy: { select: { name: true } },
      },
    }),
    prisma.company.groupBy({
      by: ["currentStatus"],
      where: { isDeleted: false },
      _count: true,
      orderBy: { _count: { currentStatus: "desc" } },
    }),
  ]);

  return {
    totalCompanies,
    activeCompanies,
    interestedCompanies,
    noResponseCompanies,
    offerReleased,
    totalAlumni,
    willingAlumni,
    overdueFollowUps,
    todayFollowUps,
    upcomingFollowUps,
    recentActivities,
    recentStatusChanges,
    statusBreakdown,
  };
}

export default async function DashboardPage() {
  const session = await getSession();
  const data = await getDashboardData();

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">
          {greeting}, {session?.name?.split(" ")[0]} 👋
        </h1>
        <p className="mt-0.5 text-sm text-gray-500 dark:text-zinc-400">
          Here&apos;s what&apos;s happening with your placement pipeline today.
        </p>
      </div>

      {/* Follow-up alerts */}
      {data.overdueFollowUps > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-900/20">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
          <div>
            <p className="text-sm font-medium text-red-800 dark:text-red-300">
              {data.overdueFollowUps} overdue follow-up{data.overdueFollowUps > 1 ? "s" : ""}
            </p>
            <p className="text-xs text-red-600 dark:text-red-400">
              These need your immediate attention
            </p>
          </div>
          <Link
            href="/dashboard/followups"
            className="ml-auto text-xs font-medium text-red-700 hover:underline dark:text-red-400"
          >
            View all →
          </Link>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard
          title="Total Companies"
          value={data.totalCompanies}
          subtitle="in pipeline"
          icon={<Building2 className="h-5 w-5" />}
          accentColor="indigo"
        />
        <StatCard
          title="Active Pipeline"
          value={data.activeCompanies}
          subtitle="ongoing outreach"
          icon={<TrendingUp className="h-5 w-5" />}
          accentColor="blue"
        />
        <StatCard
          title="Interested"
          value={data.interestedCompanies}
          subtitle="confirmed interest"
          icon={<CheckCircle2 className="h-5 w-5" />}
          accentColor="emerald"
        />
        <StatCard
          title="Offers Released"
          value={data.offerReleased}
          subtitle="placements done"
          icon={<CheckCircle2 className="h-5 w-5" />}
          accentColor="violet"
        />
        <StatCard
          title="Alumni Database"
          value={data.totalAlumni}
          subtitle={`${data.willingAlumni} willing to help`}
          icon={<GraduationCap className="h-5 w-5" />}
          accentColor="amber"
        />
        <StatCard
          title="Overdue Follow-ups"
          value={data.overdueFollowUps}
          subtitle="needs attention"
          icon={<AlertCircle className="h-5 w-5" />}
          accentColor="red"
        />
        <StatCard
          title="Today's Follow-ups"
          value={data.todayFollowUps}
          subtitle="scheduled today"
          icon={<Calendar className="h-5 w-5" />}
          accentColor="orange"
        />
        <StatCard
          title="Upcoming (7d)"
          value={data.upcomingFollowUps}
          subtitle="next 7 days"
          icon={<Clock className="h-5 w-5" />}
          accentColor="teal"
        />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Activities - 2/3 width */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Activities</CardTitle>
                <Link
                  href="/dashboard/activities"
                  className="text-xs text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  View all
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {data.recentActivities.length === 0 ? (
                  <p className="py-8 text-center text-sm text-gray-400">
                    No activities yet
                  </p>
                ) : (
                  data.recentActivities.map((activity) => (
                    <Link
                      key={activity.id}
                      href={`/dashboard/companies/${activity.companyId}`}
                      className="flex items-start gap-3 rounded-lg p-2 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-indigo-50 dark:bg-indigo-900/30">
                        <span className="text-xs">
                          {activity.type === "EMAIL" ? "✉️" :
                           activity.type === "CALL" ? "📞" :
                           activity.type === "MEETING" ? "🤝" :
                           activity.type === "WHATSAPP" ? "💬" : "📝"}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900 dark:text-zinc-100">
                          {activity.summary}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-zinc-400">
                          {activity.company.companyName} · {activity.createdBy.name}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs text-gray-400 dark:text-zinc-500">
                        {formatRelativeTime(activity.createdAt)}
                      </span>
                    </Link>
                  ))
                )}
              </div>
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
              <div className="space-y-2">
                {data.statusBreakdown.slice(0, 8).map((item) => (
                  <div key={item.currentStatus} className="flex items-center justify-between">
                    <StatusBadge status={item.currentStatus} size="sm" />
                    <span className="text-sm font-semibold text-gray-900 dark:text-zinc-100">
                      {item._count}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent status changes */}
          <Card>
            <CardHeader>
              <CardTitle>Status Changes</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {data.recentStatusChanges.map((log) => (
                  <Link
                    key={log.id}
                    href={`/dashboard/companies/${log.companyId}`}
                    className="block rounded-lg p-2 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <p className="text-sm font-medium text-gray-900 dark:text-zinc-100 truncate">
                      {log.company.companyName}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                      {log.oldStatus && <StatusBadge status={log.oldStatus} size="sm" />}
                      {log.oldStatus && <span className="text-xs text-gray-400">→</span>}
                      <StatusBadge status={log.newStatus} size="sm" />
                    </div>
                    <p className="mt-0.5 text-xs text-gray-400">
                      {log.changedBy.name} · {formatRelativeTime(log.changedAt)}
                    </p>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

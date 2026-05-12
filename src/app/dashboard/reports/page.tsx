import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STATUS_CONFIG } from "@/lib/utils";
import { Building2, TrendingUp, BarChart3, GraduationCap } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Reports" };

export default async function ReportsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-zinc-100">
          Reports &amp; Analytics
        </h1>
        <p className="mt-0.5 text-sm text-zinc-500">
          Placement pipeline overview and statistics
        </p>
      </div>

      <Suspense fallback={<ReportsSkeleton />}>
        <ReportsServerData />
      </Suspense>
    </div>
  );
}

async function ReportsServerData() {
  const [statusBreakdown, companyTypeBreakdown, totalAlumni, alumniStatusBreakdown] =
    await Promise.all([
      prisma.company.groupBy({
        by: ["currentStatus"],
        where: { isDeleted: false },
        _count: true,
        orderBy: { _count: { currentStatus: "desc" } },
      }),
      prisma.company.groupBy({
        by: ["companyType"],
        where: { isDeleted: false },
        _count: true,
        orderBy: { _count: { companyType: "desc" } },
      }),
      prisma.alumni.count({ where: { isDeleted: false } }),
      prisma.alumni.groupBy({
        by: ["currentStatus"],
        where: { isDeleted: false },
        _count: true,
        orderBy: { _count: { currentStatus: "desc" } },
      }),
    ]);

  const totalCompanies = statusBreakdown.reduce((s, i) => s + i._count, 0);
  const offerCount =
    statusBreakdown.find((s) => s.currentStatus === "OFFER_RELEASED")?._count ?? 0;
  const conversionRate =
    totalCompanies > 0 ? ((offerCount / totalCompanies) * 100).toFixed(1) : "0";

  return (
    <>
      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total Companies", value: totalCompanies, icon: Building2, color: "text-blue-400" },
          { label: "Offers Released", value: offerCount, icon: TrendingUp, color: "text-green-400" },
          { label: "Conversion Rate", value: `${conversionRate}%`, icon: BarChart3, color: "text-orange-400" },
          { label: "Alumni in DB", value: totalAlumni, icon: GraduationCap, color: "text-orange-400" },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="pt-5">
              <kpi.icon className={`h-5 w-5 ${kpi.color} mb-2`} />
              <p className="text-2xl font-bold text-zinc-100">{kpi.value}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{kpi.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Company Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Companies by Status</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {statusBreakdown.map((item) => {
              const config = STATUS_CONFIG[item.currentStatus];
              const pct = totalCompanies > 0 ? (item._count / totalCompanies) * 100 : 0;
              return (
                <div key={item.currentStatus}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
                    <span className="text-xs font-semibold text-zinc-300">
                      {item._count}
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-zinc-800">
                    <div
                      className={`h-1.5 rounded-full ${config.dot}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Company Type Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Companies by Type</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {companyTypeBreakdown.map((item) => (
              <div key={String(item.companyType)} className="flex items-center justify-between">
                <span className="text-sm text-zinc-300">
                  {item.companyType ?? "Unspecified"}
                </span>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-20 rounded-full bg-zinc-800">
                    <div
                      className="h-1.5 rounded-full bg-blue-400"
                      style={{ width: `${(item._count / totalCompanies) * 100}%` }}
                    />
                  </div>
                  <span className="w-6 text-right text-xs font-semibold text-zinc-400">
                    {item._count}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Alumni Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Alumni Outreach Status</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {alumniStatusBreakdown.map((item) => (
              <div key={item.currentStatus} className="flex items-center justify-between text-sm">
                <span className="text-zinc-300">{item.currentStatus.replace(/_/g, " ")}</span>
                <span className="font-semibold text-zinc-100">{item._count}</span>
              </div>
            ))}
            {alumniStatusBreakdown.length === 0 && (
              <p className="text-sm text-zinc-500">No alumni data yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function ReportsSkeleton() {
  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="pt-5">
              <div className="h-5 w-5 bg-zinc-800 rounded mb-2" />
              <div className="h-8 w-16 bg-zinc-800 rounded mb-1" />
              <div className="h-3 w-24 bg-zinc-800 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader><div className="h-5 w-32 bg-zinc-800 rounded" /></CardHeader>
            <CardContent className="space-y-4 pt-0">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="h-4 w-full bg-zinc-800 rounded" />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

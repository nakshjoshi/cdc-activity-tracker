import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STATUS_CONFIG } from "@/lib/utils";
import { BarChart3, TrendingUp, Building2, GraduationCap } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Reports" };

export default async function ReportsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

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
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-zinc-100">
          <BarChart3 className="h-5 w-5 text-indigo-600" />
          Reports & Analytics
        </h1>
        <p className="mt-0.5 text-sm text-gray-500 dark:text-zinc-400">
          Placement pipeline overview and statistics
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total Companies", value: totalCompanies, icon: Building2, color: "text-indigo-600" },
          { label: "Offers Released", value: offerCount, icon: TrendingUp, color: "text-emerald-600" },
          { label: "Conversion Rate", value: `${conversionRate}%`, icon: BarChart3, color: "text-blue-600" },
          { label: "Alumni in DB", value: totalAlumni, icon: GraduationCap, color: "text-amber-600" },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="pt-5">
              <kpi.icon className={`h-6 w-6 ${kpi.color} mb-2`} />
              <p className="text-2xl font-bold text-gray-900 dark:text-zinc-100">{kpi.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{kpi.label}</p>
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
                    <span className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
                      {item._count}
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-zinc-800">
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
                <span className="text-sm text-gray-700 dark:text-zinc-300">
                  {item.companyType ?? "Unspecified"}
                </span>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-20 rounded-full bg-gray-100 dark:bg-zinc-800">
                    <div
                      className="h-1.5 rounded-full bg-indigo-400"
                      style={{ width: `${(item._count / totalCompanies) * 100}%` }}
                    />
                  </div>
                  <span className="w-6 text-right text-xs font-semibold text-gray-600 dark:text-zinc-400">
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
                <span className="text-gray-700 dark:text-zinc-300">{item.currentStatus.replace(/_/g, " ")}</span>
                <span className="font-semibold text-gray-900 dark:text-zinc-100">{item._count}</span>
              </div>
            ))}
            {alumniStatusBreakdown.length === 0 && (
              <p className="text-sm text-gray-400">No alumni data yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

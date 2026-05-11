import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { Calendar, AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { CompleteFollowUpButton } from "./complete-followup-button";

export const metadata: Metadata = { title: "Follow-ups" };

export default async function FollowUpsPage() {
  const session = await getSession();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + 86400000);
  const in7Days = new Date(today.getTime() + 7 * 86400000);

  const [overdue, todayItems, upcoming] = await Promise.all([
    prisma.followUp.findMany({
      where: { status: "PENDING", followUpDate: { lt: today } },
      include: { company: { select: { id: true, companyName: true, currentStatus: true } }, createdBy: { select: { name: true } } },
      orderBy: { followUpDate: "asc" },
    }),
    prisma.followUp.findMany({
      where: { status: "PENDING", followUpDate: { gte: today, lt: tomorrow } },
      include: { company: { select: { id: true, companyName: true, currentStatus: true } }, createdBy: { select: { name: true } } },
      orderBy: { followUpDate: "asc" },
    }),
    prisma.followUp.findMany({
      where: { status: "PENDING", followUpDate: { gte: tomorrow, lte: in7Days } },
      include: { company: { select: { id: true, companyName: true, currentStatus: true } }, createdBy: { select: { name: true } } },
      orderBy: { followUpDate: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-zinc-100">
          <Calendar className="h-5 w-5 text-blue-600" />
          Follow-ups
        </h1>
        <p className="mt-0.5 text-sm text-gray-500">
          {overdue.length} overdue · {todayItems.length} today · {upcoming.length} upcoming
        </p>
      </div>

      {/* Overdue */}
      <Section
        title="Overdue"
        count={overdue.length}
        icon={<AlertCircle className="h-4 w-4 text-red-600" />}
        headerClass="text-red-700 dark:text-red-400"
        empty="No overdue follow-ups 🎉"
      >
        {overdue.map((f) => (
          <FollowUpRow key={f.id} followUp={f} variant="overdue" />
        ))}
      </Section>

      {/* Today */}
      <Section
        title="Today"
        count={todayItems.length}
        icon={<Clock className="h-4 w-4 text-orange-600" />}
        headerClass="text-orange-700 dark:text-orange-400"
        empty="Nothing scheduled for today"
      >
        {todayItems.map((f) => (
          <FollowUpRow key={f.id} followUp={f} variant="today" />
        ))}
      </Section>

      {/* Upcoming */}
      <Section
        title="Upcoming (Next 7 Days)"
        count={upcoming.length}
        icon={<Calendar className="h-4 w-4 text-blue-600" />}
        headerClass="text-blue-700 dark:text-blue-400"
        empty="No upcoming follow-ups in next 7 days"
      >
        {upcoming.map((f) => (
          <FollowUpRow key={f.id} followUp={f} variant="upcoming" />
        ))}
      </Section>
    </div>
  );
}

function Section({
  title, count, icon, headerClass, empty, children,
}: {
  title: string;
  count: number;
  icon: React.ReactNode;
  headerClass: string;
  empty: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        {icon}
        <h2 className={`text-sm font-semibold ${headerClass}`}>{title}</h2>
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-zinc-800 dark:text-zinc-400">
          {count}
        </span>
      </div>
      {count === 0 ? (
        <p className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-400 dark:border-zinc-700">
          {empty}
        </p>
      ) : (
        <div className="space-y-2">{children}</div>
      )}
    </div>
  );
}

function FollowUpRow({
  followUp,
  variant,
}: {
  followUp: {
    id: string;
    followUpDate: Date;
    followUpType: string;
    subject?: string | null;
    notes?: string | null;
    createdBy: { name: string };
    company: { id: string; companyName: string };
  };
  variant: "overdue" | "today" | "upcoming";
}) {
  const borderColor = variant === "overdue"
    ? "border-red-200 dark:border-red-900/40"
    : variant === "today"
    ? "border-orange-200 dark:border-orange-900/40"
    : "border-gray-200 dark:border-zinc-700";

  return (
    <Card className={`border ${borderColor} p-4`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/dashboard/companies/${followUp.company.id}`}
              className="text-sm font-semibold text-gray-900 hover:text-indigo-600 dark:text-zinc-100"
            >
              {followUp.company.companyName}
            </Link>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500 dark:bg-zinc-800">
              {followUp.followUpType}
            </span>
          </div>
          {followUp.subject && (
            <p className="mt-0.5 text-sm text-gray-600 dark:text-zinc-300">{followUp.subject}</p>
          )}
          <p className="mt-1 text-xs text-gray-400">
            {formatDate(followUp.followUpDate)} · Added by {followUp.createdBy.name}
          </p>
        </div>
        <CompleteFollowUpButton followUpId={followUp.id} />
      </div>
    </Card>
  );
}

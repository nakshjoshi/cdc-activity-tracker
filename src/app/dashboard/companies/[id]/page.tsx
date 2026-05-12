import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/companies/status-badge";
import { ActivityTimeline } from "@/components/companies/activity-timeline";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatDate, STATUS_CONFIG, ROLE_CONFIG, getInitials } from "@/lib/utils";
import {
  Building2, Globe, Link2, MapPin, Tag, User,
  Mail, Phone, Star, Clock, ArrowRight,
} from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { CompanyDetailActions, EditableContactCard } from "./company-detail-actions";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const company = await prisma.company.findUnique({
    where: { id },
    select: { companyName: true },
  });
  return { title: company?.companyName ?? "Company" };
}

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();

  const company = await prisma.company.findUnique({
    where: { id, isDeleted: false },
    include: {
      assignedCoordinator: { select: { id: true, name: true, email: true, role: true } },
      createdBy: { select: { name: true } },
      contacts: { orderBy: [{ isPrimary: "desc" }, { name: "asc" }] },
      activities: {
        orderBy: { createdAt: "desc" },
        include: { createdBy: { select: { name: true } } },
      },
      statusLogs: {
        orderBy: { changedAt: "desc" },
        include: { changedBy: { select: { name: true } } },
      },
      followUps: {
        where: { status: { in: ["PENDING", "OVERDUE"] } },
        orderBy: { followUpDate: "asc" },
        include: { createdBy: { select: { name: true } } },
      },
    },
  });

  if (!company) notFound();

  const overdueFollowUps = company.followUps.filter(
    (f) => new Date(f.followUpDate) < new Date() && f.status === "PENDING"
  );

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-zinc-500">
        <Link href="/dashboard/companies" className="hover:text-zinc-300">
          Companies
        </Link>
        <ArrowRight className="h-3 w-3" />
        <span className="text-zinc-100 font-medium">
          {company.companyName}
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-lg font-bold text-white shadow-lg">
            {getInitials(company.companyName)}
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-100">
              {company.companyName}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <StatusBadge status={company.currentStatus} />
              {company.companyType && (
                <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
                  {company.companyType}
                </span>
              )}
              {company.industry && (
                <span className="text-xs text-zinc-500">{company.industry}</span>
              )}
            </div>
          </div>
        </div>
        <CompanyDetailActions company={company} session={session} />
      </div>

      {/* Overdue warning */}
      {overdueFollowUps.length > 0 && (
        <div className="rounded-xl border border-red-900/40 bg-red-950/30 p-3 text-sm text-red-400">
          ⚠️ {overdueFollowUps.length} overdue follow-up{overdueFollowUps.length > 1 ? "s" : ""} for this company
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Left: details */}
        <div className="space-y-4">
          {/* Company Info */}
          <Card>
            <CardHeader>
              <CardTitle>Company Info</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {company.website && (
                <InfoRow icon={<Globe className="h-3.5 w-3.5" />} label="Website">
                  <a href={company.website} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline text-sm truncate">
                    {company.website}
                  </a>
                </InfoRow>
              )}
              {company.linkedin && (
                <InfoRow icon={<Link2 className="h-3.5 w-3.5" />} label="LinkedIn">
                  <a href={company.linkedin} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline text-sm">
                    View Profile
                  </a>
                </InfoRow>
              )}
              {(company.city || company.state) && (
                <InfoRow icon={<MapPin className="h-3.5 w-3.5" />} label="Location">
                  <span className="text-sm text-zinc-300">
                    {[company.city, company.state, company.country].filter(Boolean).join(", ")}
                  </span>
                </InfoRow>
              )}
              {company.domain && (
                <InfoRow icon={<Tag className="h-3.5 w-3.5" />} label="Domain">
                  <span className="text-sm text-zinc-300">{company.domain}</span>
                </InfoRow>
              )}
              <InfoRow icon={<Clock className="h-3.5 w-3.5" />} label="Added">
                <span className="text-sm text-zinc-500">{formatDate(company.createdAt)} by {company.createdBy.name}</span>
              </InfoRow>
              {company.assignedCoordinator && (
                <InfoRow icon={<User className="h-3.5 w-3.5" />} label="Coordinator">
                  <span className="text-sm text-zinc-300">
                    {company.assignedCoordinator.name}
                  </span>
                </InfoRow>
              )}
            </CardContent>
          </Card>

          {/* Contacts */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Contacts ({company.contacts.length})</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {company.contacts.length === 0 ? (
                <p className="text-sm text-zinc-500">No contacts added yet</p>
              ) : (
                company.contacts.map((contact) => (
                  <EditableContactCard
                    key={contact.id}
                    contact={contact}
                    companyId={company.id}
                  />
                ))
              )}
            </CardContent>
          </Card>

          {/* Status History */}
          <Card>
            <CardHeader>
              <CardTitle>Status History</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {company.statusLogs.slice(0, 8).map((log) => (
                  <div key={log.id} className="flex items-start gap-2 text-xs">
                    <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-1">
                        {log.oldStatus && <StatusBadge status={log.oldStatus} size="sm" />}
                        {log.oldStatus && <span className="text-zinc-500">→</span>}
                        <StatusBadge status={log.newStatus} size="sm" />
                      </div>
                      <p className="mt-0.5 text-zinc-500">
                        {log.changedBy.name} · {formatDate(log.changedAt)}
                      </p>
                      {log.notes && <p className="text-zinc-500 italic">{log.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Activity Timeline */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Activity Timeline ({company.activities.length})</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <ActivityTimeline activities={company.activities} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 text-zinc-500 shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-zinc-500 uppercase tracking-wide">{label}</p>
        {children}
      </div>
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { notFound } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatDate, ALUMNI_STATUS_CONFIG, getInitials } from "@/lib/utils";
import {
  Globe, Link2, MapPin, Tag, User,
  Mail, Phone, Star, Clock, ArrowRight, Building2, GraduationCap, Heart, CheckCircle2
} from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { AlumniDetailActions } from "./alumni-detail-actions";
import { ActivityTimeline } from "@/components/companies/activity-timeline";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const alumni = await prisma.alumni.findUnique({
    where: { id },
    select: { name: true },
  });
  return { title: alumni?.name ?? "Alumni Profile" };
}

export default async function AlumniDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();

  const alumni = await prisma.alumni.findUnique({
    where: { id, isDeleted: false },
    include: {
      assignedCoordinator: { select: { id: true, name: true, email: true, role: true } },
      activities: {
        orderBy: { createdAt: "desc" },
        include: { createdBy: { select: { name: true } } },
      },
    },
  });

  if (!alumni) notFound();

  const statusConfig = ALUMNI_STATUS_CONFIG[alumni.currentStatus];

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-zinc-500">
        <Link href="/dashboard/alumni" className="hover:text-zinc-300">
          Alumni
        </Link>
        <ArrowRight className="h-3 w-3" />
        <span className="text-zinc-100 font-medium">
          {alumni.name}
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-lg font-bold text-white shadow-lg">
            {getInitials(alumni.name)}
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-100">
              {alumni.name}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig.color} ${statusConfig.bg}`}>
                {statusConfig.label}
              </span>
              <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
                Batch {alumni.batch}
              </span>
              <span className="text-xs text-zinc-500">{alumni.branch}</span>
            </div>
          </div>
        </div>
        <AlumniDetailActions alumni={alumni} session={session} />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Left: details */}
        <div className="space-y-4">
          {/* Alumni Info */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Info</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {alumni.email && (
                <InfoRow icon={<Mail className="h-3.5 w-3.5" />} label="Email">
                  <a href={`mailto:${alumni.email}`} className="text-blue-400 hover:underline text-sm truncate">
                    {alumni.email}
                  </a>
                </InfoRow>
              )}
              {alumni.phone && (
                <InfoRow icon={<Phone className="h-3.5 w-3.5" />} label="Phone">
                  <a href={`tel:${alumni.phone}`} className="text-blue-400 hover:underline text-sm">
                    {alumni.phone}
                  </a>
                </InfoRow>
              )}
              {alumni.linkedin && (
                <InfoRow icon={<Link2 className="h-3.5 w-3.5" />} label="LinkedIn">
                  <a href={alumni.linkedin} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline text-sm">
                    View Profile
                  </a>
                </InfoRow>
              )}
              {alumni.currentCompany && (
                <InfoRow icon={<Building2 className="h-3.5 w-3.5" />} label="Current Role">
                  <span className="text-sm text-zinc-300">
                    {alumni.designation ? `${alumni.designation} at ` : ""}{alumni.currentCompany}
                  </span>
                </InfoRow>
              )}
              {alumni.city && (
                <InfoRow icon={<MapPin className="h-3.5 w-3.5" />} label="Location">
                  <span className="text-sm text-zinc-300">{alumni.city}</span>
                </InfoRow>
              )}
              <div className="pt-2 border-t border-zinc-800 mt-2 space-y-2">
                <div className="flex items-center gap-2">
                  <Heart className={`h-4 w-4 ${alumni.willingToHelp ? 'fill-red-400 text-red-400' : 'text-zinc-600'}`} />
                  <span className="text-sm text-zinc-400">
                    {alumni.willingToHelp ? "Willing to help with placements" : "Not marked as willing to help"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className={`h-4 w-4 ${alumni.referralCapability ? 'text-green-400' : 'text-zinc-600'}`} />
                  <span className="text-sm text-zinc-400">
                    {alumni.referralCapability ? "Can provide referrals" : "Referral status unknown"}
                  </span>
                </div>
              </div>
              <InfoRow icon={<User className="h-3.5 w-3.5" />} label="Coordinator">
                <span className="text-sm text-zinc-300">
                  {alumni.assignedCoordinator?.name ?? "Unassigned"}
                </span>
              </InfoRow>
            </CardContent>
          </Card>

          {/* Notes */}
          {alumni.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-zinc-300 whitespace-pre-wrap">{alumni.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Activity Timeline */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Activity Timeline ({alumni.activities.length})</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <ActivityTimeline activities={alumni.activities as any} />
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

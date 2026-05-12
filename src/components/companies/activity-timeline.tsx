"use client";

import { formatRelativeTime, ACTIVITY_CONFIG } from "@/lib/utils";
import { getInitials } from "@/lib/utils";
import {
  Mail, Phone, MessageCircle, Link2, Users, FileText,
  RefreshCw, ClipboardList, Calendar, MessageSquare, StickyNote,
} from "lucide-react";
import type { ActivityType } from "@prisma/client";

const ICON_MAP: Record<ActivityType, React.ComponentType<{ className?: string }>> = {
  EMAIL: Mail,
  CALL: Phone,
  WHATSAPP: MessageCircle,
  LINKEDIN: Link2,
  MEETING: Users,
  PPT: FileText,
  FOLLOWUP: RefreshCw,
  OA_DISCUSSION: ClipboardList,
  INTERVIEW_COORDINATION: Calendar,
  INTERNAL_DISCUSSION: MessageSquare,
  NOTE: StickyNote,
};

interface TimelineActivity {
  id: string;
  type: ActivityType;
  summary: string;
  notes?: string | null;
  nextAction?: string | null;
  nextFollowUpDate?: Date | null;
  createdAt: Date;
  createdBy: { name: string };
}

interface ActivityTimelineProps {
  activities: TimelineActivity[];
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  if (activities.length === 0) {
    return (
      <div className="py-12 text-center">
        <MessageSquare className="mx-auto h-10 w-10 text-zinc-600" />
        <p className="mt-2 text-sm text-zinc-500">No activities yet. Log the first interaction!</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {activities.map((activity, i) => {
        const config = ACTIVITY_CONFIG[activity.type];
        const Icon = ICON_MAP[activity.type];
        const isLast = i === activities.length - 1;

        return (
          <div key={activity.id} className="flex gap-3">
            {/* Timeline line + icon */}
            <div className="flex flex-col items-center">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-zinc-800 bg-zinc-900 shadow-sm"
              >
                <Icon className={`h-3.5 w-3.5 ${config.color}`} />
              </div>
              {!isLast && (
                <div className="mt-1 h-full w-0.5 bg-zinc-700" />
              )}
            </div>

            {/* Content */}
            <div className={`pb-5 flex-1 min-w-0 ${isLast ? "" : ""}`}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <span className={`text-xs font-semibold uppercase tracking-wide ${config.color}`}>
                    {config.label}
                  </span>
                  <p className="mt-0.5 text-sm font-medium text-zinc-100">
                    {activity.summary}
                  </p>
                </div>
                <span className="text-xs text-zinc-500 whitespace-nowrap">
                  {formatRelativeTime(activity.createdAt)}
                </span>
              </div>

              {activity.notes && (
                <p className="mt-1 text-sm text-zinc-400 leading-relaxed">
                  {activity.notes}
                </p>
              )}

              <div className="mt-1.5 flex flex-wrap items-center gap-3">
                {/* Creator */}
                <div className="flex items-center gap-1.5">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-900/50 text-[10px] font-bold text-blue-400">
                    {getInitials(activity.createdBy.name)}
                  </div>
                  <span className="text-xs text-zinc-500">
                    {activity.createdBy.name}
                  </span>
                </div>

                {activity.nextAction && (
                  <span className="rounded-full bg-amber-950/30 px-2 py-0.5 text-xs text-amber-400">
                    Next: {activity.nextAction}
                  </span>
                )}

                {activity.nextFollowUpDate && (
                  <span className="rounded-full bg-blue-950/30 px-2 py-0.5 text-xs text-blue-400">
                    Follow-up: {new Date(activity.nextFollowUpDate).toLocaleDateString("en-IN")}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

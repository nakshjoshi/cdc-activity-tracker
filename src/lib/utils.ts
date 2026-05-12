import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { CompanyStatus, ActivityType, Role, AlumniStatus } from "@prisma/client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const target = new Date(date);
  const diff = now.getTime() - target.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 7) return formatDate(date);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "just now";
}

// ─── Status display config ────────────────────────────────

export const STATUS_CONFIG: Record<
  CompanyStatus,
  { label: string; color: string; bg: string; dot: string }
> = {
  LEAD_FOUND:            { label: "Lead Found",            color: "text-slate-600",  bg: "bg-slate-100",    dot: "bg-slate-400"  },
  COLD_OUTREACH_PENDING: { label: "Cold Outreach Pending", color: "text-orange-700", bg: "bg-orange-50",    dot: "bg-orange-400" },
  COLD_EMAIL_SENT:       { label: "Cold Email Sent",       color: "text-blue-700",   bg: "bg-blue-50",      dot: "bg-blue-400"   },
  FOLLOWUP_PENDING:      { label: "Follow-up Pending",     color: "text-yellow-700", bg: "bg-yellow-50",    dot: "bg-yellow-400" },
  FOLLOWUP_DONE:         { label: "Follow-up Done",        color: "text-teal-700",   bg: "bg-teal-50",      dot: "bg-teal-400"   },
  INTERESTED:            { label: "Interested",            color: "text-green-700",  bg: "bg-green-50",     dot: "bg-green-400"  },
  PPT_SCHEDULED:         { label: "PPT Scheduled",         color: "text-purple-700", bg: "bg-purple-50",    dot: "bg-purple-400" },
  OA_SCHEDULED:          { label: "OA Scheduled",          color: "text-indigo-700", bg: "bg-indigo-50",    dot: "bg-indigo-400" },
  INTERVIEW_SCHEDULED:   { label: "Interview Scheduled",   color: "text-violet-700", bg: "bg-violet-50",    dot: "bg-violet-400" },
  HIRING_IN_PROGRESS:    { label: "Hiring In Progress",    color: "text-cyan-700",   bg: "bg-cyan-50",      dot: "bg-cyan-400"   },
  OFFER_RELEASED:        { label: "Offer Released",        color: "text-emerald-700",bg: "bg-emerald-50",   dot: "bg-emerald-500"},
  REJECTED:              { label: "Rejected",              color: "text-red-700",    bg: "bg-red-50",       dot: "bg-red-400"    },
  NO_RESPONSE:           { label: "No Response",           color: "text-gray-600",   bg: "bg-gray-100",     dot: "bg-gray-400"   },
  ON_HOLD:               { label: "On Hold",               color: "text-amber-700",  bg: "bg-amber-50",     dot: "bg-amber-400"  },
  CLOSED:                { label: "Closed",                color: "text-zinc-600",   bg: "bg-zinc-100",     dot: "bg-zinc-400"   },
};

export const ACTIVITY_CONFIG: Record<ActivityType, { label: string; icon: string; color: string }> = {
  EMAIL:                  { label: "Email",                 icon: "Mail",       color: "text-blue-600"   },
  CALL:                   { label: "Call",                  icon: "Phone",      color: "text-green-600"  },
  WHATSAPP:               { label: "WhatsApp",              icon: "MessageCircle", color: "text-emerald-600" },
  LINKEDIN:               { label: "LinkedIn",              icon: "Linkedin",   color: "text-blue-700"   },
  MEETING:                { label: "Meeting",               icon: "Users",      color: "text-purple-600" },
  PPT:                    { label: "PPT",                   icon: "Presentation",color: "text-orange-600" },
  FOLLOWUP:               { label: "Follow-up",             icon: "RefreshCw",  color: "text-yellow-600" },
  OA_DISCUSSION:          { label: "OA Discussion",         icon: "ClipboardList",color: "text-indigo-600"},
  INTERVIEW_COORDINATION: { label: "Interview Coordination",icon: "Calendar",   color: "text-violet-600" },
  INTERNAL_DISCUSSION:    { label: "Internal Discussion",   icon: "MessageSquare",color: "text-gray-600"  },
  NOTE:                   { label: "Note",                  icon: "StickyNote", color: "text-amber-600"  },
  TPO_FORM:               { label: "TPO Form",              icon: "FileInput",  color: "text-teal-500"   },
};

export const ROLE_CONFIG: Record<Role, { label: string; color: string; bg: string }> = {
  ADMIN:               { label: "Admin",               color: "text-red-700",    bg: "bg-red-50"    },
  CDC_CHAIRMAN:        { label: "CDC Chairman",         color: "text-purple-700", bg: "bg-purple-50" },
  CDC_HEAD:            { label: "CDC Head",             color: "text-blue-700",   bg: "bg-blue-50"   },
  FACULTY_COORDINATOR: { label: "Faculty Coordinator",  color: "text-teal-700",   bg: "bg-teal-50"   },
  STUDENT_COORDINATOR: { label: "Student Coordinator",  color: "text-green-700",  bg: "bg-green-50"  },
};

export const ALUMNI_STATUS_CONFIG: Record<AlumniStatus, { label: string; color: string; bg: string }> = {
  NOT_CONTACTED: { label: "Not Contacted", color: "text-gray-600",   bg: "bg-gray-100"   },
  CONTACTED:     { label: "Contacted",     color: "text-blue-700",   bg: "bg-blue-50"    },
  RESPONDED:     { label: "Responded",     color: "text-teal-700",   bg: "bg-teal-50"    },
  INTERESTED:    { label: "Interested",    color: "text-green-700",  bg: "bg-green-50"   },
  REFERRED:      { label: "Referred",      color: "text-emerald-700",bg: "bg-emerald-50" },
  NOT_INTERESTED:{ label: "Not Interested",color: "text-red-700",    bg: "bg-red-50"     },
  INACTIVE:      { label: "Inactive",      color: "text-zinc-600",   bg: "bg-zinc-100"   },
};

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function slugify(str: string): string {
  return str.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n) + "…" : str;
}

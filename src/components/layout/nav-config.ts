import {
  LayoutDashboard, Building2, Users, GraduationCap,
  Calendar, Activity, BarChart3, ClipboardCheck
} from "lucide-react";
import type { Role } from "@prisma/client";

export interface NavItem {
  label: string;
  href: string;
  icon: any;
  exact?: boolean;
  roles?: Role[];
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard",  href: "/dashboard",            icon: LayoutDashboard, exact: true },
  { label: "Companies",  href: "/dashboard/companies",  icon: Building2 },
  { label: "Alumni",     href: "/dashboard/alumni",     icon: GraduationCap },
  { label: "Tasks",      href: "/dashboard/tasks",      icon: ClipboardCheck },
  { label: "Follow-Ups", href: "/dashboard/followups",  icon: Calendar },
  { label: "Activities", href: "/dashboard/activities", icon: Activity },
  {
    label: "Users",
    href: "/dashboard/users",
    icon: Users,
    roles: ["ADMIN"] as Role[],
  },
  {
    label: "Reports",
    href: "/dashboard/reports",
    icon: BarChart3,
    roles: ["ADMIN", "CDC_CHAIRMAN", "CDC_HEAD", "FACULTY_COORDINATOR"] as Role[],
  },
];

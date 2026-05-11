"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Building2, Users, GraduationCap,
  Calendar, Bell, Settings, ChevronLeft, ChevronRight,
  Activity, BookOpen,
} from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "Companies",
    href: "/dashboard/companies",
    icon: Building2,
  },
  {
    label: "Alumni",
    href: "/dashboard/alumni",
    icon: GraduationCap,
  },
  {
    label: "Follow-Ups",
    href: "/dashboard/followups",
    icon: Calendar,
  },
  {
    label: "Activities",
    href: "/dashboard/activities",
    icon: Activity,
  },
  {
    label: "Users",
    href: "/dashboard/users",
    icon: Users,
  },
  {
    label: "Reports",
    href: "/dashboard/reports",
    icon: BookOpen,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-gray-200 bg-white transition-all duration-300 dark:border-zinc-800 dark:bg-zinc-950",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center justify-between border-b border-gray-100 px-4 dark:border-zinc-800">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <GraduationCap className="h-4 w-4" />
            </div>
            <span className="text-sm font-bold text-gray-900 dark:text-zinc-100">
              TNP Tracker
            </span>
          </div>
        )}
        {collapsed && (
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white mx-auto">
            <GraduationCap className="h-4 w-4" />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-zinc-800",
            collapsed && "mx-auto"
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                    active
                      ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100",
                    collapsed && "justify-center"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0",
                      active ? "text-indigo-600 dark:text-indigo-400" : ""
                    )}
                  />
                  {!collapsed && item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom */}
      <div className="border-t border-gray-100 p-2 dark:border-zinc-800">
        <Link
          href="/dashboard/settings"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-all hover:bg-gray-100 hover:text-gray-900 dark:text-zinc-400 dark:hover:bg-zinc-800",
            collapsed && "justify-center"
          )}
        >
          <Settings className="h-4 w-4 shrink-0" />
          {!collapsed && "Settings"}
        </Link>
      </div>
    </aside>
  );
}

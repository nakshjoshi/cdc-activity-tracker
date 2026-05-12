"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Search, LogOut, User, Menu } from "lucide-react";
import { cn, getInitials, ROLE_CONFIG } from "@/lib/utils";
import { NAV_ITEMS } from "./nav-config";
import { logoutAction } from "@/actions/auth";
import { useState, useRef, useEffect } from "react";
import type { Role } from "@prisma/client";

interface TopbarProps {
  user: {
    name: string;
    email: string;
    role: Role;
  };
}

export function Topbar({ user }: TopbarProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const mobileNavRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
      if (mobileNavRef.current && !mobileNavRef.current.contains(e.target as Node)) {
        setMobileNavOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Close mobile nav on route change
  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  const roleConfig = ROLE_CONFIG[user.role];

  return (
    <header className="flex h-14 items-center justify-between px-4 sm:px-5 glass-panel rounded-2xl shrink-0">
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <div className="md:hidden relative" ref={mobileNavRef}>
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-400 hover:bg-zinc-800 transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>

          {mobileNavOpen && (
            <div className="absolute left-0 top-full mt-2 w-60 rounded-2xl border border-zinc-700 bg-zinc-900 shadow-xl z-50 overflow-hidden">
              <div className="p-2 space-y-0.5">
                {NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(user.role)).map((item) => {
                  const Icon = item.icon;
                  const active = item.exact
                    ? pathname === item.href
                    : pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                        active
                          ? "bg-blue-950/30 text-blue-400"
                          : "text-zinc-400 hover:bg-zinc-800"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="hidden sm:flex items-center gap-2 rounded-xl bg-zinc-800/80 px-3 py-2 w-56 lg:w-72 transition-all focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:bg-zinc-900">
          <Search className="h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1.5">
        {/* Notifications */}
        <button className="hidden sm:flex h-9 w-9 items-center justify-center rounded-xl text-zinc-400 hover:bg-zinc-800 transition-colors relative">
          <Bell className="h-[18px] w-[18px]" />
        </button>

        {/* Divider */}
        <div className="hidden sm:block h-6 w-px bg-zinc-700 mx-1" />

        {/* User menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 hover:bg-zinc-800 transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-xs font-bold text-white">
              {getInitials(user.name)}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-zinc-100 leading-tight">
                {user.name}
              </p>
              <p className="text-[11px] text-zinc-500 leading-tight">
                {roleConfig.label}
              </p>
            </div>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl border border-zinc-700 bg-zinc-900 shadow-xl z-50 overflow-hidden">
              <div className="border-b border-zinc-800 px-4 py-3">
                <p className="text-sm font-medium text-zinc-100">{user.name}</p>
                <p className="text-xs text-zinc-500 truncate">{user.email}</p>
              </div>
              <div className="p-1.5">
                <Link
                  href="/dashboard/settings"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors"
                >
                  <User className="h-4 w-4" />
                  Settings
                </Link>
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-red-600 hover:bg-red-950/30 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

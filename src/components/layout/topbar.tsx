"use client";

import { Bell, Search, Sun, Moon, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getInitials, ROLE_CONFIG } from "@/lib/utils";
import { useTheme } from "next-themes";
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
  const { theme, setTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const roleConfig = ROLE_CONFIG[user.role];

  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-950">
      {/* Search */}
      <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 dark:border-zinc-700 dark:bg-zinc-800 max-w-xs w-full">
        <Search className="h-3.5 w-3.5 text-gray-400" />
        <input
          type="text"
          placeholder="Search companies, alumni..."
          className="w-full bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none dark:text-zinc-100"
        />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </Button>

        {/* User menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-gray-100 transition-colors dark:hover:bg-zinc-800"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
              {getInitials(user.name)}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-xs font-medium text-gray-900 dark:text-zinc-100 leading-none">
                {user.name}
              </p>
              <span
                className={`inline-block mt-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${roleConfig.color} ${roleConfig.bg}`}
              >
                {roleConfig.label}
              </span>
            </div>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 rounded-xl border border-gray-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900 z-50">
              <div className="border-b border-gray-100 px-3 py-2 dark:border-zinc-800">
                <p className="text-sm font-medium text-gray-900 dark:text-zinc-100">{user.name}</p>
                <p className="text-xs text-gray-500 dark:text-zinc-400">{user.email}</p>
              </div>
              <button className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-zinc-300 dark:hover:bg-zinc-800">
                <User className="h-3.5 w-3.5" />
                Profile
              </button>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign out
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

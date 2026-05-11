"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Button } from "./button";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export function Modal({ open, onClose, title, description, children, size = "md", className }: ModalProps) {
  React.useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Panel */}
      <div
        className={cn(
          "relative z-10 w-full rounded-2xl border border-gray-200 bg-white shadow-2xl",
          "dark:border-zinc-700 dark:bg-zinc-900",
          "animate-in fade-in zoom-in-95 duration-200",
          sizeMap[size],
          className
        )}
      >
        {/* Header */}
        {(title || description) && (
          <div className="flex items-start justify-between gap-4 border-b border-gray-100 p-5 dark:border-zinc-800">
            <div>
              {title && <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">{title}</h2>}
              {description && <p className="mt-0.5 text-sm text-gray-500 dark:text-zinc-400">{description}</p>}
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0 -mt-1 -mr-1">
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        {/* Body */}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

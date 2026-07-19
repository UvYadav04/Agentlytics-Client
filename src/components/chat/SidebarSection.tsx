"use client";

import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

/**
 * Collapsible "floating card" used for every accordion row in the left and
 * right sidebars (Files, Chats, Dashboards, Charts). Open/close state is
 * always controlled by the parent so siblings can be coordinated into a
 * single-open accordion - this component only renders what it's told.
 *
 * The chevron points right while collapsed and rotates to point down once
 * expanded - a quick visual cue of "there's more here, tap to open" vs.
 * "this is showing everything."
 */
export default function SidebarSection({
  title,
  count,
  dotColor = "bg-accent",
  open,
  onToggle,
  children,
}: {
  title: string;
  count?: number;
  dotColor?: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className={`shrink-0 overflow-hidden rounded-2xl border bg-card transition-all ${
        open ? "border-accent/25 shadow-card" : "border-border shadow-none"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full cursor-pointer select-none items-center justify-between px-3.5 py-3 text-xs font-semibold uppercase tracking-wide text-muted outline-none hover:text-text"
      >
        <span className="flex items-center gap-1.5">
          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotColor}`} />
          {title}
          {typeof count === "number" && (
            <span className="rounded-full bg-border px-1.5 py-0.5 text-[10px] font-semibold text-muted">
              {count}
            </span>
          )}
        </span>
        <ChevronRight
          className={`h-4 w-4 shrink-0 text-muted transition-transform duration-200 ${
            open ? "rotate-90" : "rotate-0"
          }`}
        />
      </button>
      {open && (
        <div className="border-t border-border/70 px-3 pb-3 pt-2.5">{children}</div>
      )}
    </div>
  );
}

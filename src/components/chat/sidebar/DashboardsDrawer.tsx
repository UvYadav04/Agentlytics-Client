"use client";

import Link from "next/link";
import { LayoutDashboard, PanelLeftClose } from "lucide-react";
import { useGetDashboardsQuery } from "@/lib/api/apiSlice";

export default function DashboardsDrawer({
  workspaceId,
  onClose,
}: {
  workspaceId: string;
  onClose: () => void;
}) {
  const { data: dashboards = [] } = useGetDashboardsQuery(workspaceId);

  return (
    <div className="flex h-full flex-col bg-card text-text">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold tracking-tight text-text">Dashboards</span>
          <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-semibold text-accent-dark">
            {dashboards.length}
          </span>
        </div>
        <button
          onClick={onClose}
          aria-label="Close panel"
          className="rounded-lg p-1 text-muted hover:bg-bg hover:text-text"
          title="Close drawer"
        >
          <PanelLeftClose className="size-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {dashboards.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-12 text-center text-xs text-muted">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/15 text-gold">
              <LayoutDashboard className="size-6" />
            </div>
            <p className="mt-3 font-semibold text-text">No dashboards yet</p>
            <p className="mt-1 text-[11px] text-muted">
              Ask in chat for a live dashboard on a connected database, e.g. &quot;create revenue breakdown by region dashboard&quot;.
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {dashboards.map((d) => (
              <Link
                key={d.id}
                href={`/dashboard/${d.id}`}
                className="group flex items-center justify-between rounded-xl border border-border bg-card p-3 shadow-sm transition-all hover:border-gold hover:bg-gold/5"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <LayoutDashboard className="size-4 shrink-0 text-gold" />
                  <span className="truncate text-xs font-medium text-text group-hover:text-accent-dark">
                    {d.name}
                  </span>
                </div>
                {d.source !== "parquet" && (
                  <span className="shrink-0 rounded-full bg-accent-soft px-1.5 py-0.5 text-[9px] font-bold text-accent-dark">
                    LIVE
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

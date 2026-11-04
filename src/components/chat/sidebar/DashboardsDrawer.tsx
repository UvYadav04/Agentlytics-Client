"use client";

import Link from "next/link";
import { LayoutDashboard, PanelLeftClose, Sparkles } from "lucide-react";
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
    <div className="flex h-full flex-col bg-[#13151b] text-[#d1d5db]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1e212b] px-4 py-3.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold tracking-tight text-white">Dashboards</span>
          <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[11px] font-semibold text-accent">
            {dashboards.length}
          </span>
        </div>
        <button
          onClick={onClose}
          aria-label="Close panel"
          className="rounded-lg p-1 text-[#9ca3af] hover:bg-white/[0.08] hover:text-white"
          title="Close drawer"
        >
          <PanelLeftClose className="size-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {dashboards.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-12 text-center text-xs text-[#9ca3af]">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/15 text-gold">
              <LayoutDashboard className="size-6" />
            </div>
            <p className="mt-3 font-semibold text-white">No dashboards yet</p>
            <p className="mt-1 text-[11px] text-[#6b7280]">
              Ask in chat for a live dashboard on a connected database, e.g. &quot;create revenue breakdown by region dashboard&quot;.
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {dashboards.map((d) => (
              <Link
                key={d.id}
                href={`/dashboard/${d.id}`}
                className="group flex items-center justify-between rounded-xl border border-[#252836] bg-[#191c25] p-3 transition-all hover:border-gold hover:bg-[#1d212c]"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <LayoutDashboard className="size-4 shrink-0 text-gold" />
                  <span className="truncate text-xs font-medium text-white group-hover:text-gold">
                    {d.name}
                  </span>
                </div>
                {d.source !== "parquet" && (
                  <span className="shrink-0 rounded-full bg-teal/20 px-1.5 py-0.5 text-[9px] font-bold text-teal">
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


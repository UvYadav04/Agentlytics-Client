"use client";

import Link from "next/link";
import { BarChart2, LineChart, PanelLeftClose } from "lucide-react";
import { useGetWorkspaceChartsQuery } from "@/lib/api/apiSlice";

export default function MetricsDrawer({
  workspaceId,
  onClose,
}: {
  workspaceId: string;
  onClose: () => void;
}) {
  const { data: charts = [] } = useGetWorkspaceChartsQuery(workspaceId);

  return (
    <div className="flex h-full flex-col bg-[#13151b] text-[#d1d5db]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1e212b] px-4 py-3.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold tracking-tight text-white">Metrics & Charts</span>
          <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[11px] font-semibold text-accent">
            {charts.length}
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
        {charts.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-12 text-center text-xs text-[#9ca3af]">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/15 text-accent">
              <LineChart className="size-6" />
            </div>
            <p className="mt-3 font-semibold text-white">No charts generated yet</p>
            <p className="mt-1 text-[11px] text-[#6b7280]">
              Ask questions in chat like &quot;chart monthly sales trends&quot; to produce interactive charts.
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {charts.map((c) => (
              <Link
                key={c.id}
                href={`/chart/${c.id}`}
                className="group flex flex-col rounded-xl border border-[#252836] bg-[#191c25] p-3 transition-all hover:border-accent hover:bg-[#1d212c]"
              >
                <div className="flex items-center gap-2.5">
                  <BarChart2 className="size-4 shrink-0 text-accent" />
                  <span className="truncate text-xs font-medium text-white group-hover:text-accent">
                    {c.title}
                  </span>
                </div>
                <span className="mt-1.5 pl-6 text-[10px] text-[#6b7280]">
                  {new Date(c.created_at).toLocaleDateString()}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


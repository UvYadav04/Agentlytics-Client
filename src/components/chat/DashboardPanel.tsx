"use client";

import Link from "next/link";
import { useGetDashboardsQuery, useGetWorkspaceChartsQuery } from "@/lib/api/apiSlice";

export default function DashboardPanel({ workspaceId }: { workspaceId: string }) {
  const { data: charts = [] } = useGetWorkspaceChartsQuery(workspaceId);
  const { data: dashboards = [] } = useGetDashboardsQuery(workspaceId);

  return (
    <aside className="hidden lg:flex w-72 shrink-0 flex-col border-l border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
          Dashboards
        </h3>
      </div>
      <div className="max-h-56 overflow-y-auto px-3 py-2 space-y-1.5 border-b border-border">
        {dashboards.length === 0 && (
          <p className="text-xs text-muted px-1 py-2">
            No dashboards yet - group charts from a chat message.
          </p>
        )}
        {dashboards.map((d) => (
          <Link
            key={d.id}
            href={`/dashboard/${d.id}`}
            className="block rounded-lg px-2 py-1.5 text-sm hover:bg-bg truncate"
          >
            {d.name}
            <span className="ml-1.5 text-xs text-muted">
              ({d.chart_ids.length})
            </span>
          </Link>
        ))}
      </div>

      <div className="border-b border-border px-4 py-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
          Charts
        </h3>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-2 space-y-2">
        {charts.length === 0 && (
          <p className="text-xs text-muted px-1 py-2">
            Charts generated in this workspace will show up here.
          </p>
        )}
        {charts.map((c) => (
          <Link
            key={c.id}
            href={`/chart/${c.id}`}
            className="block rounded-card border border-border p-2.5 hover:border-accent transition-colors"
          >
            <div className="text-sm truncate">{c.title}</div>
            <div className="text-[11px] text-muted mt-0.5">
              {new Date(c.created_at).toLocaleDateString()}
            </div>
          </Link>
        ))}
      </div>
    </aside>
  );
}

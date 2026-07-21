"use client";

import Link from "next/link";
import { useGetDashboardsQuery, useGetWorkspaceChartsQuery } from "@/lib/api/apiSlice";
import SidebarSection from "./SidebarSection";

export type RightSection = "dashboards" | "charts" | null;

export default function DashboardPanel({
  workspaceId,
  section,
  onSectionChange,
}: {
  workspaceId: string;
  section: RightSection;
  onSectionChange: (section: RightSection) => void;
}) {
  const { data: charts = [] } = useGetWorkspaceChartsQuery(workspaceId);
  const { data: dashboards = [] } = useGetDashboardsQuery(workspaceId);

  return (
    <aside className="hidden w-72 shrink-0 flex-col gap-3 overflow-y-auto p-3 lg:flex">
      <SidebarSection
        title="Dashboards"
        count={dashboards.length}
        dotColor="bg-plum"
        open={section === "dashboards"}
        onToggle={() => onSectionChange(section === "dashboards" ? null : "dashboards")}
      >
        <div className="max-h-56 space-y-1.5 overflow-y-auto">
          {dashboards.length === 0 && (
            <p className="px-1 py-2 text-xs text-muted">
              No dashboards yet
            </p>
          )}
          {dashboards.map((d) => (
            <Link
              key={d.id}
              href={`/dashboard/${d.id}`}
              className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-plum/10 hover:text-plum"
            >
              <span className="flex min-w-0 items-center gap-1.5">
                {d.real_time && (
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" title="Real-time" />
                )}
                <span className="truncate">{d.name}</span>
              </span>
              <span className="shrink-0 rounded-full bg-border px-1.5 py-0.5 text-[10px] font-medium text-muted">
                {d.chart_ids.length}
              </span>
            </Link>
          ))}
        </div>
      </SidebarSection>

      <SidebarSection
        title="Charts"
        count={charts.length}
        dotColor="bg-accent"
        open={section === "charts"}
        onToggle={() => onSectionChange(section === "charts" ? null : "charts")}
      >
        <div className="max-h-[28rem] space-y-2 overflow-y-auto">
          {charts.length === 0 && (
            <p className="px-1 py-2 text-xs text-muted">
              Charts generated in this workspace will show up here.
            </p>
          )}
          {charts.map((c) => (
            <Link
              key={c.id}
              href={`/chart/${c.id}`}
              className="group relative block overflow-hidden rounded-card border border-border bg-bg p-2.5 shadow-card transition-all hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-[0_0_25px_-12px_rgba(204,120,92,0.5)]"
            >
              <span className="absolute inset-y-0 left-0 w-1 bg-accent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="truncate text-sm">{c.title}</div>
              <div className="mt-0.5 text-[11px] text-muted">
                {new Date(c.created_at).toLocaleDateString()}
              </div>
            </Link>
          ))}
        </div>
      </SidebarSection>
    </aside>
  );
}

"use client";

import Link from "next/link";
import { FileText, FileSpreadsheet } from "lucide-react";
import { useGetWorkspaceChartsQuery, useGetWorkspaceReportsQuery } from "@/lib/api/apiSlice";
import SidebarSection from "./SidebarSection";

export type RightSection = "charts" | "reports" | "csv" | null;

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
  const { data: allReports = [] } = useGetWorkspaceReportsQuery(workspaceId);
  // The backend stores CSV exports as Report docs too (format: "csv") - see
  // _persist_artifacts in worker_service/tasks/investigation.py - so this one query covers
  // both sections, split client-side by format.
  const reports = allReports.filter((r) => r.format !== "csv");
  const csvFiles = allReports.filter((r) => r.format === "csv");

  return (
    <aside className="hidden w-72 shrink-0 flex-col gap-3 overflow-y-auto p-3 lg:flex">
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

      <SidebarSection
        title="Reports"
        count={reports.length}
        dotColor="bg-plum"
        open={section === "reports"}
        onToggle={() => onSectionChange(section === "reports" ? null : "reports")}
      >
        <div className="max-h-56 space-y-1.5 overflow-y-auto">
          {reports.length === 0 && (
            <p className="px-1 py-2 text-xs text-muted">
              Reports generated in this workspace will show up here.
            </p>
          )}
          {reports.map((r) => (
            <Link
              key={r.id}
              href={`/report/${r.id}`}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-plum/10 hover:text-plum"
            >
              <FileText className="h-3.5 w-3.5 shrink-0 text-muted" />
              <span className="truncate">{r.title}</span>
            </Link>
          ))}
        </div>
      </SidebarSection>

      <SidebarSection
        title="CSV Files"
        count={csvFiles.length}
        dotColor="bg-teal"
        open={section === "csv"}
        onToggle={() => onSectionChange(section === "csv" ? null : "csv")}
      >
        <div className="max-h-56 space-y-1.5 overflow-y-auto">
          {csvFiles.length === 0 && (
            <p className="px-1 py-2 text-xs text-muted">
              CSV exports generated in this workspace will show up here.
            </p>
          )}
          {csvFiles.map((r) => (
            <Link
              key={r.id}
              href={`/report/${r.id}`}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-teal/10 hover:text-teal"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 shrink-0 text-muted" />
              <span className="truncate">{r.title}</span>
            </Link>
          ))}
        </div>
      </SidebarSection>
    </aside>
  );
}

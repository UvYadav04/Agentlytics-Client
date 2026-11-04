"use client";

import Link from "next/link";
import { FileSpreadsheet, FileText, PanelLeftClose } from "lucide-react";
import { useGetWorkspaceReportsQuery } from "@/lib/api/apiSlice";

export default function ReportsDrawer({
  workspaceId,
  onClose,
}: {
  workspaceId: string;
  onClose: () => void;
}) {
  const { data: allReports = [] } = useGetWorkspaceReportsQuery(workspaceId);
  const reports = allReports.filter((r) => r.format !== "csv");
  const csvFiles = allReports.filter((r) => r.format === "csv");

  return (
    <div className="flex h-full flex-col bg-card text-text">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold tracking-tight text-text">Reports & Logs</span>
          <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-semibold text-accent-dark">
            {allReports.length}
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
      <div className="flex-1 space-y-4 overflow-y-auto p-3">
        {allReports.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-12 text-center text-xs text-muted">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-plum/15 text-plum">
              <FileText className="size-6" />
            </div>
            <p className="mt-3 font-semibold text-text">No reports generated</p>
            <p className="mt-1 text-[11px] text-muted">
              Ask in chat to generate comprehensive reports or CSV export tables from your data.
            </p>
          </div>
        ) : (
          <>
            {reports.length > 0 && (
              <div>
                <div className="mb-2 text-xs font-semibold text-muted">REPORTS</div>
                <div className="space-y-1.5">
                  {reports.map((r) => (
                    <Link
                      key={r.id}
                      href={`/report/${r.id}`}
                      className="group flex items-center gap-2.5 rounded-xl border border-border bg-card p-3 shadow-sm transition-all hover:border-plum hover:bg-plum/5"
                    >
                      <FileText className="size-4 shrink-0 text-plum" />
                      <span className="truncate text-xs font-medium text-text group-hover:text-plum">
                        {r.title}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {csvFiles.length > 0 && (
              <div>
                <div className="mb-2 text-xs font-semibold text-muted">CSV EXPORTS</div>
                <div className="space-y-1.5">
                  {csvFiles.map((c) => (
                    <Link
                      key={c.id}
                      href={`/report/${c.id}`}
                      className="group flex items-center gap-2.5 rounded-xl border border-border bg-card p-3 shadow-sm transition-all hover:border-teal hover:bg-teal/5"
                    >
                      <FileSpreadsheet className="size-4 shrink-0 text-teal" />
                      <span className="truncate text-xs font-medium text-text group-hover:text-teal">
                        {c.title}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

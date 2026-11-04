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
    <div className="flex h-full flex-col bg-[#13151b] text-[#d1d5db]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1e212b] px-4 py-3.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold tracking-tight text-white">Reports & Logs</span>
          <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[11px] font-semibold text-accent">
            {allReports.length}
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
      <div className="flex-1 space-y-4 overflow-y-auto p-3">
        {allReports.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-12 text-center text-xs text-[#9ca3af]">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-plum/15 text-plum">
              <FileText className="size-6" />
            </div>
            <p className="mt-3 font-semibold text-white">No reports generated</p>
            <p className="mt-1 text-[11px] text-[#6b7280]">
              Ask in chat to generate comprehensive reports or CSV export tables from your data.
            </p>
          </div>
        ) : (
          <>
            {reports.length > 0 && (
              <div>
                <div className="mb-2 text-xs font-semibold text-[#6b7280]">REPORTS</div>
                <div className="space-y-1.5">
                  {reports.map((r) => (
                    <Link
                      key={r.id}
                      href={`/report/${r.id}`}
                      className="group flex items-center gap-2.5 rounded-xl border border-[#252836] bg-[#191c25] p-3 transition-all hover:border-plum hover:bg-[#1d212c]"
                    >
                      <FileText className="size-4 shrink-0 text-plum" />
                      <span className="truncate text-xs font-medium text-white group-hover:text-plum">
                        {r.title}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {csvFiles.length > 0 && (
              <div>
                <div className="mb-2 text-xs font-semibold text-[#6b7280]">CSV EXPORTS</div>
                <div className="space-y-1.5">
                  {csvFiles.map((c) => (
                    <Link
                      key={c.id}
                      href={`/report/${c.id}`}
                      className="group flex items-center gap-2.5 rounded-xl border border-[#252836] bg-[#191c25] p-3 transition-all hover:border-teal hover:bg-[#1d212c]"
                    >
                      <FileSpreadsheet className="size-4 shrink-0 text-teal" />
                      <span className="truncate text-xs font-medium text-white group-hover:text-teal">
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


"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  useGetDashboardQuery,
  useGetFilesQuery,
  useRefreshDashboardMutation,
  useRelinkDashboardFileMutation,
} from "@/lib/api/apiSlice";
import AutoHeightIframe from "@/components/AutoHeightIframe";

function timeAgo(iso: string) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function DataSourceRow({
  dashboardId,
  workspaceId,
  fileId,
  filename,
  otherFiles,
}: {
  dashboardId: string;
  workspaceId: string;
  fileId: string;
  filename: string;
  otherFiles: { id: string; filename: string }[];
}) {
  const [relink, { isLoading }] = useRelinkDashboardFileMutation();
  const [picking, setPicking] = useState(false);

  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-bg/60 px-2.5 py-1.5 text-xs">
      <span className="truncate" title={filename}>
        {filename}
      </span>
      {picking ? (
        <select
          autoFocus
          disabled={isLoading}
          className="shrink-0 rounded-md border border-border bg-card px-1.5 py-1 text-[11px]"
          defaultValue=""
          onBlur={() => setPicking(false)}
          onChange={(e) => {
            const newFileId = e.target.value;
            setPicking(false);
            if (!newFileId) return;
            relink({ dashboardId, workspaceId, oldFileId: fileId, newFileId });
          }}
        >
          <option value="" disabled>
            Replace with...
          </option>
          {otherFiles.map((f) => (
            <option key={f.id} value={f.id}>
              {f.filename}
            </option>
          ))}
        </select>
      ) : (
        <button
          className="shrink-0 text-[11px] font-medium text-accent-dark hover:underline disabled:opacity-50"
          disabled={isLoading || otherFiles.length === 0}
          onClick={() => setPicking(true)}
        >
          {isLoading ? "Swapping..." : "Replace"}
        </button>
      )}
    </div>
  );
}

export default function DashboardDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: dashboard, isError, isLoading } = useGetDashboardQuery(params.id);
  const { data: files = [] } = useGetFilesQuery(dashboard?.workspace_id ?? "", {
    skip: !dashboard?.workspace_id,
  });
  const [refresh, { isLoading: isRefreshing }] = useRefreshDashboardMutation();

  if (isError) return <div className="p-10 text-center text-rust">Failed to load dashboard</div>;
  if (isLoading || !dashboard) return <div className="p-10 text-center text-muted">Loading...</div>;

  const filesById = new Map(files.map((f) => [f.id, f]));
  const readyFiles = files.filter((f) => f.status === "ready");

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <button
        onClick={() => router.back()}
        className="mb-4 flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-accent-dark"
      >
        &#8592; Back to chat
      </button>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-semibold">{dashboard.name}</h1>
          {dashboard.real_time && (
            <span className="flex items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-semibold text-accent-dark">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Real-time
            </span>
          )}
        </div>

        {dashboard.real_time && (
          <div className="flex items-center gap-3">
            {dashboard.last_refreshed_at && (
              <span className="text-[11px] text-muted">
                Refreshed {timeAgo(dashboard.last_refreshed_at)}
              </span>
            )}
            <button
              onClick={() => refresh({ dashboardId: dashboard.id, workspaceId: dashboard.workspace_id })}
              disabled={isRefreshing}
              className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-text transition-colors hover:border-accent hover:text-accent-dark disabled:opacity-50"
            >
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        )}
      </div>

      {dashboard.real_time && dashboard.file_ids.length > 0 && (
        <div className="mb-6 rounded-card border border-border bg-card p-4 shadow-card">
          <h2 className="mb-2 text-xs font-semibold text-muted">Data sources</h2>
          <div className="space-y-1.5">
            {dashboard.file_ids.map((fileId) => (
              <DataSourceRow
                key={fileId}
                dashboardId={dashboard.id}
                workspaceId={dashboard.workspace_id}
                fileId={fileId}
                filename={filesById.get(fileId)?.filename ?? fileId}
                otherFiles={readyFiles.filter((f) => f.id !== fileId)}
              />
            ))}
          </div>
        </div>
      )}

      {dashboard.charts.length === 0 ? (
        <p className="text-muted text-sm">This dashboard has no charts yet.</p>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {dashboard.charts.map((c) => (
            <div
              key={c.id}
              className="rounded-card border border-border bg-card p-4 shadow-card"
            >
              <h2 className="text-sm font-medium mb-2 truncate">{c.title}</h2>
              <AutoHeightIframe
                src={c.url}
                title={c.title}
                className="w-full rounded-lg border border-border"
              />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

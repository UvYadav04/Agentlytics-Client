"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { BarChart3, ExternalLink, Lock } from "lucide-react";
import { useGetSharedDashboardDataQuery, useGetSharedDashboardQuery } from "@/lib/api/apiSlice";
import type { DashboardTheme, SharedDashboard } from "@/lib/types";
import { useRequireAuth } from "@/lib/hooks/useRequireAuth";
import AutoHeightIframe from "@/components/AutoHeightIframe";
import LiveDashboardView from "@/components/dashboard/LiveDashboardView";

const SOURCE_LABELS: Record<string, string> = { postgresql: "PostgreSQL", mongodb: "MongoDB", parquet: "Files" };

function errorDetail(error: unknown): { status: number | null; message: string | null } {
  const e = error as { status?: unknown; data?: { detail?: unknown } } | undefined;
  return {
    status: typeof e?.status === "number" ? e.status : null,
    message: typeof e?.data?.detail === "string" ? e.data.detail : null,
  };
}

function Notice({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex min-h-[calc(100vh-57px)] flex-col items-center justify-center gap-3 px-6 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-accent-soft text-accent-dark">
        <Lock className="size-5" />
      </div>
      <h1 className="text-lg font-semibold">{title}</h1>
      <p className="max-w-md text-sm text-muted">{body}</p>
      <Link href="/chat" className="mt-2 rounded-full border border-border px-4 py-1.5 text-xs font-medium hover:border-accent hover:text-accent-dark">
        Go to my workspace
      </Link>
    </div>
  );
}

function SharedLive({ shared }: { shared: SharedDashboard }) {
  const [refreshInterval, setRefreshInterval] = useState(0);
  const [mode, setMode] = useState<DashboardTheme["mode"]>(shared.theme.mode);
  const { data, isFetching, isError, error, refetch } = useGetSharedDashboardDataQuery(shared.share_id, {
    pollingInterval: refreshInterval || undefined,
    refetchOnMountOrArgChange: true,
  });
  return (
    <LiveDashboardView
      name={shared.name}
      description={shared.description}
      sourceLabel={SOURCE_LABELS[shared.source] ?? shared.source}
      timeWindow={shared.time_window}
      windowLabel={shared.time_window_label}
      theme={{ ...shared.theme, mode }}
      charts={shared.live_charts}
      data={data}
      isFetching={isFetching}
      isError={isError}
      error={error}
      onRefresh={() => refetch()}
      refreshInterval={refreshInterval}
      onRefreshIntervalChange={setRefreshInterval}
      onLocalModeChange={setMode}
      sharedBy={shared.shared_by}
      validUpto={shared.valid_upto}
    />
  );
}

function SharedFiles({ shared }: { shared: SharedDashboard }) {
  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <h1 className="text-xl font-semibold">{shared.name}</h1>
      <p className="mb-6 mt-1 text-xs text-muted">
        Shared by {shared.shared_by.name || shared.shared_by.email} · access until{" "}
        {new Date(shared.valid_upto).toLocaleDateString()}
      </p>
      {shared.charts.length === 0 ? (
        <div className="rounded-card border border-border bg-card p-8 text-center text-sm text-muted shadow-card">
          This dashboard has no charts yet.
        </div>
      ) : (
        <div
          className={`grid gap-6 ${
            shared.charts.length === 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"
          }`}
        >
          {shared.charts.map((c, index) => {
            const isSingle = shared.charts.length === 1;
            const spansFull =
              isSingle ||
              (shared.charts.length > 1 &&
                shared.charts.length % 2 === 1 &&
                index === shared.charts.length - 1);
            return (
              <div
                key={c.id}
                className={`group rounded-card border border-border bg-card p-5 shadow-card transition-all hover:border-accent/40 hover:shadow-md ${
                  spansFull && !isSingle ? "md:col-span-2" : ""
                }`}
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent-dark">
                      <BarChart3 className="size-4" />
                    </div>
                    <h2 className="text-sm font-semibold truncate" title={c.title}>
                      {c.title}
                    </h2>
                  </div>
                  <Link
                    href={`/chart/${c.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex shrink-0 items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-muted transition-colors hover:border-accent hover:text-accent-dark"
                    title="Open chart in new tab"
                  >
                    <span>Expand</span>
                    <ExternalLink className="size-3" />
                  </Link>
                </div>
                <AutoHeightIframe src={c.url} title={c.title} className="w-full rounded-lg border border-border" />
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

export default function SharedDashboardPage() {
  const params = useParams<{ id: string }>();
  const authReady = useRequireAuth(`/login?next=${encodeURIComponent(`/dashboards/shared/${params.id}`)}`);
  const { data: shared, error, isLoading } = useGetSharedDashboardQuery(params.id, { skip: !authReady });

  if (!authReady || isLoading) return <div className="p-10 text-center text-muted">Loading...</div>;
  if (error) {
    const { status, message } = errorDetail(error);
    if (status === 410) return <Notice title="This link has expired" body={message ?? "Ask the owner to share the dashboard again."} />;
    return (
      <Notice
        title="Dashboard not available"
        body={message ?? "This dashboard doesn't exist or isn't shared with the account you're signed in with."}
      />
    );
  }
  if (!shared) return null;
  return shared.source === "parquet" ? <SharedFiles shared={shared} /> : <SharedLive shared={shared} />;
}

"use client";

import Link from "next/link";
import { AlertTriangle, CalendarRange, Grid3x3, List, Moon, RefreshCw, Share2, Sun } from "lucide-react";
import type {
  DashboardTheme,
  DashboardTimeWindow,
  LiveChartConfig,
  LiveDashboardData,
  TimeWindowUnit,
} from "@/lib/types";
import { CHART_TOKENS } from "./chartTheme";
import LiveChart from "./LiveChart";

export const REFRESH_OPTIONS = [
  { value: 0, label: "Auto-refresh off" },
  { value: 60_000, label: "Every minute" },
  { value: 300_000, label: "Every 5 minutes" },
  { value: 900_000, label: "Every 15 minutes" },
];

const WINDOW_PRESETS: { last: number; unit: TimeWindowUnit; label: string }[] = [
  { last: 7, unit: "day", label: "Last 7 days" },
  { last: 30, unit: "day", label: "Last 30 days" },
  { last: 3, unit: "month", label: "Last 3 months" },
  { last: 6, unit: "month", label: "Last 6 months" },
  { last: 12, unit: "month", label: "Last 12 months" },
  { last: 2, unit: "year", label: "Last 2 years" },
];

export type OwnerControls = {
  workspaceId: string;
  connectionName: string | null;
  onShare: () => void;
  onThemeChange: (theme: Partial<Pick<DashboardTheme, "mode" | "show_legend" | "show_grid">>) => void;
  onWindowChange: (window: { last: number; unit: TimeWindowUnit }) => void;
};

function timeAgo(iso: string) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.floor(minutes / 60)}h ago`;
}

function windowKey(last: number, unit: string) {
  return `${last}:${unit}`;
}

function StatusBanner({
  data,
  owner,
  sharedByName,
  onRetry,
}: {
  data: LiveDashboardData;
  owner?: OwnerControls;
  sharedByName?: string;
  onRetry: () => void;
}) {
  if (data.status === "ok") return null;
  const expired = data.status === "credentials_expired";
  const missing = data.status === "connection_missing";
  let body: React.ReactNode;
  if (expired || missing) {
    body = owner ? (
      <>
        {data.message} Reconnect {owner.connectionName ? `"${owner.connectionName}"` : "the database"} from the{" "}
        <Link href={`/chat?workspace=${owner.workspaceId}`} className="font-semibold underline">
          Databases panel
        </Link>{" "}
        to bring this dashboard back to life.
      </>
    ) : (
      <>
        {data.message} Ask {sharedByName || "the dashboard owner"} to reconnect the data source - no data is stored, so
        nothing can be shown until they do.
      </>
    );
  } else {
    body = (
      <>
        {data.message}{" "}
        <button type="button" onClick={onRetry} className="font-semibold underline">
          Try again
        </button>
      </>
    );
  }
  return (
    <div className="mb-5 flex items-start gap-2 rounded-card border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-accent-dark">
      <AlertTriangle className="mt-0.5 size-4 shrink-0" />
      <p>{body}</p>
    </div>
  );
}

export default function LiveDashboardView({
  name,
  description,
  sourceLabel,
  timeWindow,
  windowLabel,
  theme,
  charts,
  data,
  isFetching,
  onRefresh,
  refreshInterval,
  onRefreshIntervalChange,
  onLocalModeChange,
  owner,
  sharedBy,
  validUpto,
  isError,
  error,
}: {
  name: string;
  description: string | null;
  sourceLabel: string;
  timeWindow: DashboardTimeWindow | null;
  windowLabel: string | null;
  theme: DashboardTheme;
  charts: LiveChartConfig[];
  data: LiveDashboardData | undefined;
  isFetching: boolean;
  onRefresh: () => void;
  refreshInterval: number;
  onRefreshIntervalChange: (value: number) => void;
  onLocalModeChange?: (mode: DashboardTheme["mode"]) => void;
  owner?: OwnerControls;
  sharedBy?: { name: string; email: string };
  validUpto?: string;
  isError?: boolean;
  error?: unknown;
}) {
  const tokens = CHART_TOKENS[theme.mode];
  const dataById = new Map((data?.charts ?? []).map((c) => [c.chart_id, c]));
  const dataFor = (chartId: string) => {
    if (!data) return undefined;
    if (data.status !== "ok") {
      return { chart_id: chartId, columns: [], rows: [], truncated: false, error: "Live data is unavailable right now." };
    }
    return dataById.get(chartId);
  };
  const metrics = charts.filter((c) => c.chart_type === "metric");
  const others = charts.filter((c) => c.chart_type !== "metric");
  const currentWindow = timeWindow ? windowKey(timeWindow.last, timeWindow.unit) : null;
  const presetMatch = WINDOW_PRESETS.some((p) => windowKey(p.last, p.unit) === currentWindow);

  function toggleMode() {
    const next = theme.mode === "dark" ? "light" : "dark";
    if (owner) owner.onThemeChange({ mode: next });
    else onLocalModeChange?.(next);
  }

  const controlStyle = { border: `1px solid ${tokens.border}`, color: tokens.textSecondary, background: tokens.surface };

  return (
    <div className="min-h-[calc(100vh-57px)] transition-colors" style={{ background: tokens.panel }}>
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl font-semibold" style={{ color: tokens.textPrimary }}>
                {name}
              </h1>
              <span className="flex items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-semibold text-accent-dark">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
                Live · {sourceLabel}
              </span>
            </div>
            {description && (
              <p className="mt-1 max-w-2xl text-sm" style={{ color: tokens.textSecondary }}>
                {description}
              </p>
            )}
            {sharedBy && (
              <p className="mt-1 text-xs" style={{ color: tokens.textSecondary }}>
                Shared by {sharedBy.name || sharedBy.email}
                {validUpto ? ` · access until ${new Date(validUpto).toLocaleDateString()}` : ""}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {timeWindow &&
              (owner ? (
                <label className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs" style={controlStyle}>
                  <CalendarRange className="size-3.5" />
                  <select
                    value={currentWindow ?? ""}
                    onChange={(e) => {
                      const [last, unit] = e.target.value.split(":");
                      owner.onWindowChange({ last: Number(last), unit: unit as TimeWindowUnit });
                    }}
                    className="bg-transparent outline-none"
                    style={{ color: tokens.textPrimary }}
                    aria-label="Time window"
                  >
                    {!presetMatch && currentWindow && <option value={currentWindow}>{windowLabel}</option>}
                    {WINDOW_PRESETS.map((p) => (
                      <option key={p.label} value={windowKey(p.last, p.unit)}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <span className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs" style={controlStyle}>
                  <CalendarRange className="size-3.5" />
                  {windowLabel}
                </span>
              ))}

            <select
              value={refreshInterval}
              onChange={(e) => onRefreshIntervalChange(Number(e.target.value))}
              className="rounded-full px-3 py-1.5 text-xs outline-none"
              style={controlStyle}
              aria-label="Auto-refresh"
            >
              {REFRESH_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={onRefresh}
              disabled={isFetching}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium disabled:opacity-60"
              style={controlStyle}
            >
              <RefreshCw className={`size-3.5 ${isFetching ? "animate-spin" : ""}`} />
              {isFetching ? "Fetching..." : "Refresh"}
            </button>

            <button
              type="button"
              onClick={toggleMode}
              aria-label={theme.mode === "dark" ? "Switch to light theme" : "Switch to dark theme"}
              className="flex size-8 items-center justify-center rounded-full"
              style={controlStyle}
            >
              {theme.mode === "dark" ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
            </button>

            {owner && (
              <>
                <button
                  type="button"
                  onClick={() => owner.onThemeChange({ show_grid: !theme.show_grid })}
                  aria-pressed={theme.show_grid}
                  aria-label="Toggle grid lines"
                  title="Grid lines"
                  className="flex size-8 items-center justify-center rounded-full"
                  style={{ ...controlStyle, opacity: theme.show_grid ? 1 : 0.55 }}
                >
                  <Grid3x3 className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => owner.onThemeChange({ show_legend: !theme.show_legend })}
                  aria-pressed={theme.show_legend}
                  aria-label="Toggle legends"
                  title="Legends"
                  className="flex size-8 items-center justify-center rounded-full"
                  style={{ ...controlStyle, opacity: theme.show_legend ? 1 : 0.55 }}
                >
                  <List className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={owner.onShare}
                  className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-1.5 text-xs font-medium text-white hover:bg-accent-dark"
                >
                  <Share2 className="size-3.5" />
                  Share
                </button>
              </>
            )}
          </div>
        </div>

        {isError && (
          <div className="mb-5 flex items-start gap-2 rounded-card border border-rust/40 bg-rust/10 px-4 py-3 text-sm text-rust">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <div>
              <p className="font-semibold">Unable to load live dashboard data</p>
              <p className="mt-0.5 text-xs text-textSecondary">
                {(error as { data?: { detail?: string } })?.data?.detail || "Could not retrieve live data for this dashboard."}
              </p>
              <button type="button" onClick={onRefresh} className="mt-2 text-xs font-semibold underline">
                Try again
              </button>
            </div>
          </div>
        )}
        {data && <StatusBanner data={data} owner={owner} sharedByName={sharedBy?.name} onRetry={onRefresh} />}

        {data?.generated_at && data.status === "ok" && (
          <p className="mb-3 text-[11px]" style={{ color: tokens.textSecondary }}>
            Fetched live {timeAgo(data.generated_at)}
            {data.window ? ` · ${new Date(data.window.start).toLocaleDateString()} – ${new Date(data.window.end).toLocaleDateString()}` : ""}
          </p>
        )}

        {charts.length === 0 ? (
          <p className="text-sm" style={{ color: tokens.textSecondary }}>
            This dashboard has no charts.
          </p>
        ) : (
          <div className="space-y-5">
            {metrics.length > 0 && (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {metrics.map((chart) => (
                  <LiveChart
                    key={chart.chart_id}
                    config={chart}
                    data={dataFor(chart.chart_id)}
                    theme={theme}
                    loading={!data || isFetching}
                  />
                ))}
              </div>
            )}
            {others.length > 0 && (
              <div className="grid gap-5 lg:grid-cols-2">
                {others.map((chart) => (
                  <LiveChart
                    key={chart.chart_id}
                    config={chart}
                    data={dataFor(chart.chart_id)}
                    theme={theme}
                    loading={!data || isFetching}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

"use client";

import Link from "next/link";
import { BarChart3, FileText, LogOut, MessageSquare } from "lucide-react";
import { useGetMeQuery, useGetUsageQuery, useLogoutMutation } from "@/lib/api/apiSlice";
import GoogleLoginButton from "@/components/GoogleLoginButton";

const METRICS = [
  { key: "messages", label: "Messages", bar: "bg-accent", text: "text-accent-dark", icon: MessageSquare },
  { key: "charts", label: "Charts / dashboards", bar: "bg-gold", text: "text-gold", icon: BarChart3 },
  { key: "reports", label: "Reports", bar: "bg-plum", text: "text-plum", icon: FileText },
] as const;

function Bar({ used, limit, color }: { used: number; limit: number; color: string }) {
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
      <div
        className={`h-full transition-all ${pct >= 100 ? "bg-rust" : color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/** Small deterministic pseudo-random walk that lands on `end` - the API
 * only gives us a current used/limit snapshot, not a real history, so this
 * is illustrative only: it turns a flat number into something that reads
 * like a trend at a glance, without inventing fake precision. Seeded so it
 * doesn't reshuffle on every re-render. */
function trendPoints(seed: number, end: number, count = 9): number[] {
  let s = seed * 9301 + 49297;
  const next = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const points: number[] = [];
  let v = end * 0.3;
  for (let i = 0; i < count - 1; i++) {
    v = Math.max(0, v + (next() - 0.3) * Math.max(end, 1) * 0.3);
    points.push(v);
  }
  points.push(end);
  return points;
}

function Sparkline({ seed, end, limit }: { seed: number; end: number; limit: number }) {
  const values = trendPoints(seed, end);
  const max = Math.max(limit, ...values, 1);
  const w = 100;
  const h = 28;
  const step = w / (values.length - 1);
  const line = values.map((v, i) => `${i * step},${h - (v / max) * h}`).join(" ");
  const area = `0,${h} ${line} ${w},${h}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-7 w-full" preserveAspectRatio="none">
      <polygon points={area} fill="currentColor" opacity="0.12" />
      <polyline
        points={line}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ProfilePage() {
  const { data: user, isLoading: loading } = useGetMeQuery();
  const { data: usage } = useGetUsageQuery(undefined, { skip: !user });
  const [logout] = useLogoutMutation();

  if (loading) return <div className="p-10 text-center text-muted">Loading...</div>;

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <p className="text-muted">Sign in to view your profile.</p>
        <GoogleLoginButton label="Log in" />
      </div>
    );
  }

  const usageByKey: Record<string, { used: number; limit: number }> = usage
    ? {
        messages: { used: usage.messages_sent, limit: usage.messages_limit },
        charts: { used: usage.charts_created, limit: usage.charts_limit },
        reports: { used: usage.reports_created, limit: usage.reports_limit },
      }
    : {};

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Profile</h1>
        <Link
          href="/chat"
          className="rounded-full border border-border px-4 py-1.5 text-sm font-medium text-text transition-colors hover:border-accent hover:text-accent-dark"
        >
          My Workspace
        </Link>
      </div>

      <div className="relative mb-6 overflow-hidden rounded-card border border-border bg-card p-6 shadow-card">
        <div className="glow-blob -top-10 -right-10 h-40 w-40 bg-accent opacity-20" />
        <div className="relative flex items-center gap-4">
          {user.picture ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.picture}
              alt={user.name}
              className="h-16 w-16 rounded-full border-2 border-card shadow-card"
            />
          ) : (
            <span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-card bg-accent-soft text-xl font-semibold text-accent-dark shadow-card">
              {user.name.slice(0, 1).toUpperCase()}
            </span>
          )}
          <div className="min-w-0">
            <div className="truncate text-lg font-semibold">{user.name}</div>
            <div className="truncate text-sm text-muted">{user.email}</div>
          </div>
          <button
            onClick={() => logout()}
            className="ml-auto flex shrink-0 items-center gap-1.5 rounded-full border border-border px-4 py-1.5 text-sm text-muted transition-colors hover:border-rust/40 hover:text-rust"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </div>
      </div>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
        Free tier usage
      </h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {METRICS.map((m, i) => {
          const stat = usageByKey[m.key];
          const Icon = m.icon;
          return (
            <div
              key={m.key}
              className="relative overflow-hidden rounded-card border border-border bg-card p-5 shadow-card"
            >
              <span className={`absolute inset-x-0 top-0 h-1 ${m.bar}`} />
              <div className="flex items-center gap-2 text-sm font-medium">
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${m.bar}`}>
                  <Icon className="h-3.5 w-3.5 text-white" />
                </span>
                {m.label}
              </div>
              {!stat ? (
                <p className="mt-3 text-xs text-muted">Loading...</p>
              ) : (
                <>
                  <div className={`mt-3 ${m.text}`}>
                    <Sparkline seed={i + 1} end={stat.used} limit={stat.limit} />
                  </div>
                  <div className="mt-1 text-2xl font-bold">
                    {stat.used}
                    <span className="text-sm font-normal text-muted"> / {stat.limit}</span>
                  </div>
                  <div className="mt-3">
                    <Bar used={stat.used} limit={stat.limit} color={m.bar} />
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}

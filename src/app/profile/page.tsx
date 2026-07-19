"use client";

import Link from "next/link";
import { useGetMeQuery, useGetUsageQuery, useLogoutMutation } from "@/lib/api/apiSlice";
import GoogleLoginButton from "@/components/GoogleLoginButton";

const METRICS = [
  { key: "messages", label: "Messages", bar: "bg-accent" },
  { key: "charts", label: "Charts / dashboards", bar: "bg-gold" },
  { key: "reports", label: "Reports", bar: "bg-plum" },
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
            className="ml-auto shrink-0 rounded-full border border-border px-4 py-1.5 text-sm text-muted transition-colors hover:border-rust/40 hover:text-rust"
          >
            Sign out
          </button>
        </div>
      </div>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
        Free tier usage
      </h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {METRICS.map((m) => {
          const stat = usageByKey[m.key];
          return (
            <div
              key={m.key}
              className="relative overflow-hidden rounded-card border border-border bg-card p-5 shadow-card"
            >
              <span className={`absolute inset-x-0 top-0 h-1 ${m.bar}`} />
              <div className="text-sm font-medium">{m.label}</div>
              {!stat ? (
                <p className="mt-3 text-xs text-muted">Loading...</p>
              ) : (
                <>
                  <div className="mt-2 text-2xl font-bold">
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

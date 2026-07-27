"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { BarChart3, FileText, KeyRound, LogOut, MessageSquare, ShieldCheck } from "lucide-react";
import { useChangePasswordMutation, useGetMeQuery, useGetUsageQuery, useLogoutMutation } from "@/lib/api/apiSlice";

function extractErrorMessage(err: unknown, fallback: string): string {
  const data = (err as { data?: unknown } | undefined)?.data as
    | { detail?: string | { msg?: string }[] }
    | undefined;
  if (typeof data?.detail === "string") return data.detail;
  if (Array.isArray(data?.detail) && data.detail[0]?.msg) return data.detail[0].msg as string;
  return fallback;
}

// hasPassword=false means a Google-only account - no current_password field/check makes sense
// yet (see api_service/routers/auth.py's change_password), and the copy/button reflect "set"
// rather than "change" since there's nothing to change from.
function ChangePasswordCard({ hasPassword }: { hasPassword: boolean }) {
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      await changePassword({
        current_password: hasPassword ? currentPassword : undefined,
        new_password: newPassword,
        confirm_new_password: confirmPassword,
      }).unwrap();
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(extractErrorMessage(err, "Something went wrong. Try again."));
    }
  }

  return (
    <div className="relative overflow-hidden rounded-card border border-border bg-card p-6 shadow-card">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent">
          <KeyRound className="h-3.5 w-3.5 text-white" />
        </span>
        {hasPassword ? "Change password" : "Set a password"}
      </div>
      {!hasPassword && (
        <p className="mt-2 text-xs text-muted">
          Your account currently only signs in with Google - set a password to also log in with
          email.
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        {error && (
          <div className="rounded-lg border border-rust/30 bg-rust/5 px-3 py-2 text-xs text-rust">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-lg border border-accent/30 bg-accent-soft/50 px-3 py-2 text-xs text-accent-dark">
            Password updated.
          </div>
        )}

        {hasPassword && (
          <div>
            <label htmlFor="current_password" className="text-xs font-medium text-muted">
              Current password
            </label>
            <input
              id="current_password"
              type="password"
              required
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none transition-colors focus:border-accent"
            />
          </div>
        )}
        <div>
          <label htmlFor="new_password" className="text-xs font-medium text-muted">
            New password
          </label>
          <input
            id="new_password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none transition-colors focus:border-accent"
          />
        </div>
        <div>
          <label htmlFor="confirm_new_password" className="text-xs font-medium text-muted">
            Confirm new password
          </label>
          <input
            id="confirm_new_password"
            type="password"
            required
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none transition-colors focus:border-accent"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-white shadow-card transition-colors hover:bg-accent-dark disabled:opacity-60"
        >
          {isLoading ? "Saving..." : hasPassword ? "Update password" : "Set password"}
        </button>
      </form>
    </div>
  );
}

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
        <Link
          href="/login"
          className="rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-white shadow-card transition-colors hover:bg-accent-dark"
        >
          Log in
        </Link>
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
            <div className="flex items-center gap-1.5">
              <span className="truncate text-sm text-muted">{user.email}</span>
              {user.email_verified && (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-medium text-accent-dark">
                  <ShieldCheck className="h-3 w-3" />
                  Verified
                </span>
              )}
            </div>
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

      <div className="mb-6">
        <ChangePasswordCard hasPassword={user.has_password} />
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

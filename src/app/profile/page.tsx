"use client";

import { useGetMeQuery, useGetUsageQuery } from "@/lib/api/apiSlice";
import GoogleLoginButton from "@/components/GoogleLoginButton";

function Bar({ used, limit }: { used: number; limit: number }) {
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-border">
      <div
        className={`h-full ${pct >= 100 ? "bg-rust" : "bg-accent"}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function ProfilePage() {
  const { data: user, isLoading: loading } = useGetMeQuery();
  const { data: usage } = useGetUsageQuery(undefined, { skip: !user });

  if (loading) return <div className="p-10 text-center text-muted">Loading...</div>;

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <p className="text-muted">Sign in to view your profile.</p>
        <GoogleLoginButton />
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-2xl font-bold mb-8">Profile</h1>

      <div className="rounded-card border border-border bg-card p-6 shadow-card mb-6 flex items-center gap-4">
        {user.picture ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.picture} alt={user.name} className="h-14 w-14 rounded-full" />
        ) : (
          <span className="h-14 w-14 rounded-full bg-accent-soft text-accent-dark flex items-center justify-center text-xl font-semibold">
            {user.name.slice(0, 1).toUpperCase()}
          </span>
        )}
        <div>
          <div className="font-semibold">{user.name}</div>
          <div className="text-sm text-muted">{user.email}</div>
        </div>
      </div>

      <div className="rounded-card border border-border bg-card p-6 shadow-card">
        <h2 className="font-semibold mb-4">Free tier usage</h2>
        {!usage ? (
          <p className="text-sm text-muted">Loading usage...</p>
        ) : (
          <div className="space-y-4">
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span>Messages</span>
                <span className="text-muted">
                  {usage.messages_sent} / {usage.messages_limit}
                </span>
              </div>
              <Bar used={usage.messages_sent} limit={usage.messages_limit} />
            </div>
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span>Charts / dashboards</span>
                <span className="text-muted">
                  {usage.charts_created} / {usage.charts_limit}
                </span>
              </div>
              <Bar used={usage.charts_created} limit={usage.charts_limit} />
            </div>
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span>Reports</span>
                <span className="text-muted">
                  {usage.reports_created} / {usage.reports_limit}
                </span>
              </div>
              <Bar used={usage.reports_created} limit={usage.reports_limit} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

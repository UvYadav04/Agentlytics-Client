"use client";

import { useParams, useRouter } from "next/navigation";
import { useGetDashboardQuery } from "@/lib/api/apiSlice";

export default function DashboardDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: dashboard, isError, isLoading } = useGetDashboardQuery(params.id);

  if (isError) return <div className="p-10 text-center text-rust">Failed to load dashboard</div>;
  if (isLoading || !dashboard) return <div className="p-10 text-center text-muted">Loading...</div>;

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <button
        onClick={() => router.back()}
        className="mb-4 flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-accent-dark"
      >
        &#8592; Back to chat
      </button>
      <h1 className="text-xl font-semibold mb-6">{dashboard.name}</h1>

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
              <iframe
                src={c.url}
                sandbox="allow-scripts"
                className="w-full rounded-lg border border-border"
                style={{ height: "420px" }}
                title={c.title}
              />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

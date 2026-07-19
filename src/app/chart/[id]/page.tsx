"use client";

import { useParams, useRouter } from "next/navigation";
import { useGetChartQuery } from "@/lib/api/apiSlice";

export default function ChartPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: chart, isError, isLoading } = useGetChartQuery(params.id);

  if (isError) {
    return <div className="p-10 text-center text-rust">Failed to load chart</div>;
  }
  if (isLoading || !chart) {
    return <div className="p-10 text-center text-muted">Loading...</div>;
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <button
        onClick={() => router.back()}
        className="mb-4 flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-accent-dark"
      >
        &#8592; Back to chat
      </button>
      <h1 className="text-xl font-semibold mb-4">{chart.title}</h1>
      {/* Never injected into our DOM - a sandboxed iframe loads the
          generated HTML straight from its own presigned URL. */}
      <iframe
        src={chart.url}
        sandbox="allow-scripts"
        className="w-full rounded-card border border-border bg-card shadow-card"
        style={{ height: "80vh" }}
        title={chart.title}
      />
    </main>
  );
}

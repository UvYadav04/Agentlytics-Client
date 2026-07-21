"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useGetReportQuery } from "@/lib/api/apiSlice";
import AutoHeightIframe from "@/components/AutoHeightIframe";

export default function ReportPage() {
  const params = useParams<{ id: string }>();
  const { data: report, isError, isLoading } = useGetReportQuery(params.id);
  const [markdown, setMarkdown] = useState<string | null>(null);

  useEffect(() => {
    if (report?.format === "markdown" && report.url) {
      fetch(report.url)
        .then((res) => res.text())
        .then(setMarkdown)
        .catch(() => setMarkdown(null));
    }
  }, [report?.format, report?.url]);

  if (isError) return <div className="p-10 text-center text-rust">Failed to load report</div>;
  if (isLoading || !report) return <div className="p-10 text-center text-muted">Loading...</div>;

  return (
    <main className="mx-auto max-w-3xl px-6 py-8">
      <h1 className="text-xl font-semibold mb-1">{report.title}</h1>
      <p className="text-xs text-muted mb-6">
        {new Date(report.created_at).toLocaleString()}
      </p>

      {report.status !== "ready" && (
        <div className="rounded-card border border-border bg-card p-6 shadow-card text-sm text-muted">
          {report.status === "generating"
            ? "Still generating..."
            : `Failed to generate${report.error ? `: ${report.error}` : "."}`}
        </div>
      )}

      {report.status === "ready" && report.format === "markdown" && (
        <div className="markdown rounded-card border border-border bg-card p-8 shadow-card">
          {markdown ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
          ) : (
            <p className="text-muted text-sm">Loading content...</p>
          )}
        </div>
      )}

      {report.status === "ready" && report.format === "csv" && report.url && (
        <div className="rounded-card border border-border bg-card p-6 shadow-card">
          <p className="text-sm text-muted mb-3">This report is a CSV export.</p>
          <a
            href={report.url}
            download
            className="inline-block rounded-full bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-dark transition-colors"
          >
            Download CSV
          </a>
        </div>
      )}

      {report.status === "ready" && report.format === "html" && report.url && (
        <AutoHeightIframe
          src={report.url}
          title={report.title}
          className="w-full rounded-card border border-border bg-card shadow-card"
        />
      )}
    </main>
  );
}

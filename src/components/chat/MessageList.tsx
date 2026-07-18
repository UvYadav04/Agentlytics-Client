"use client";

import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useGetChartQuery, useGetMessagesQuery, useGetReportQuery } from "@/lib/api/apiSlice";
import InvestigationTrail from "./InvestigationTrail";

function ChartThumb({ chartId }: { chartId: string }) {
  const { data: chart } = useGetChartQuery(chartId);
  return (
    <Link
      href={`/chart/${chartId}`}
      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs hover:border-accent transition-colors"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
      {chart?.title || "Loading..."}
    </Link>
  );
}

function ReportThumb({ reportId }: { reportId: string }) {
  const { data: report } = useGetReportQuery(reportId);
  return (
    <Link
      href={`/report/${reportId}`}
      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs hover:border-accent transition-colors"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-plum" />
      {report?.title || "Loading..."}
    </Link>
  );
}

export default function MessageList({
  chatId,
  liveInvestigationId,
  onLiveTerminal,
}: {
  chatId: string;
  liveInvestigationId: string | null;
  onLiveTerminal: () => void;
}) {
  const { data: messages = [] } = useGetMessagesQuery(chatId);

  if (messages.length === 0 && !liveInvestigationId) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-center text-muted px-6">
        <div className="mb-3 h-12 w-12 rounded-full bg-accent-soft flex items-center justify-center">
          <span className="h-3 w-3 rounded-full bg-accent" />
        </div>
        <p className="text-sm max-w-sm">
          Upload a file on the left, then ask a question about it - every
          answer traces back to the file it came from.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
      {messages.map((m) => (
        <div
          key={m.id}
          className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-2xl rounded-card px-4 py-3 shadow-card ${
              m.role === "user"
                ? "bg-accent text-white"
                : "bg-card border border-border"
            }`}
          >
            {m.role === "assistant" ? (
              <div className="markdown text-sm">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {m.content}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="text-sm whitespace-pre-wrap">{m.content}</p>
            )}

            {(m.chart_ids.length > 0 || m.report_id) && (
              <div className="mt-3 flex flex-wrap gap-2">
                {m.chart_ids.map((id) => (
                  <ChartThumb key={id} chartId={id} />
                ))}
                {m.report_id && <ReportThumb reportId={m.report_id} />}
              </div>
            )}

            {m.role === "assistant" && m.investigation_id && (
              <InvestigationTrail investigationId={m.investigation_id} live={false} />
            )}
          </div>
        </div>
      ))}

      {liveInvestigationId && (
        <div className="flex justify-start">
          <div className="max-w-2xl rounded-card border border-border bg-card px-4 py-3 shadow-card">
            <div className="flex items-center gap-2 text-sm text-muted">
              <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
              Investigating...
            </div>
            <InvestigationTrail
              investigationId={liveInvestigationId}
              live
              autoOpen
              onTerminal={onLiveTerminal}
            />
          </div>
        </div>
      )}
    </div>
  );
}

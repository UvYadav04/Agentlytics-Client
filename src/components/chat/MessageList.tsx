"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useGetChartQuery, useGetMessagesQuery, useGetReportQuery } from "@/lib/api/apiSlice";
import type { ChatMessage } from "@/lib/types";
import ElapsedTimer from "./ElapsedTimer";
import InvestigationTrail from "./InvestigationTrail";

function ChartThumb({ chartId }: { chartId: string }) {
  const { data: chart } = useGetChartQuery(chartId);
  return (
    <Link
      href={`/chart/${chartId}`}
      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-bg px-3 py-1.5 text-xs font-medium transition-colors hover:border-accent hover:bg-accent-soft/50 hover:text-accent-dark"
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
      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-bg px-3 py-1.5 text-xs font-medium transition-colors hover:border-plum hover:bg-plum/10 hover:text-plum"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-plum" />
      {report?.title || "Loading..."}
    </Link>
  );
}

export default function MessageList({
  chatId,
  liveInvestigationId,
  pendingMessage,
  requestStartedAt,
  onLiveTerminal,
}: {
  chatId: string;
  liveInvestigationId: string | null;
  pendingMessage: string | null;
  requestStartedAt: number | null;
  onLiveTerminal: () => void;
}) {
  const { data: messages = [] } = useGetMessagesQuery(chatId);

  const [displayMessages, setDisplayMessages] = useState<ChatMessage[]>(messages);

  useEffect(() => {
    if (!pendingMessage) {
      setDisplayMessages(messages);
      return;
    }
    const alreadyLanded = messages.some(
      (m) => m.role === "user" && m.content === pendingMessage
    );
    if (alreadyLanded) {
      setDisplayMessages(messages);
      return;
    }
    setDisplayMessages([
      ...messages,
      {
        id: "pending",
        chat_id: chatId,
        role: "user",
        content: pendingMessage,
        investigation_id: null,
        chart_ids: [],
        report_id: null,
        created_at: new Date().toISOString(),
      },
    ]);
  }, [messages, pendingMessage, chatId]);

  if (displayMessages.length === 0 && !liveInvestigationId && !pendingMessage) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-center text-muted px-6">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-accent/20 bg-accent-soft">
          <span className="h-3 w-3 rounded-full bg-accent" />
        </div>
        <p className="text-sm max-w-sm">
          Upload a file, get files ready and analyze your data.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-bg px-6 py-6 space-y-5">
      {displayMessages.map((m) => (
        <div
          key={m.id}
          className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <div className="max-w-2xl">
            {m.role === "assistant" && m.investigation_id && (
              <InvestigationTrail investigationId={m.investigation_id} live={false} />
            )}

            {m.role === "assistant" ? (
              <div className={`markdown text-base ${m.investigation_id ? "mt-3" : ""}`}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {m.content}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="rounded-card border border-border px-4 py-2.5 text-base whitespace-pre-wrap">
                {m.content}
              </p>
            )}

            {(m.chart_ids.length > 0 || m.report_id) && (
              <div
                className={`mt-3 flex flex-wrap gap-2 ${
                  m.role === "user" ? "justify-end" : ""
                }`}
              >
                {m.chart_ids.map((id) => (
                  <ChartThumb key={id} chartId={id} />
                ))}
                {m.report_id && <ReportThumb reportId={m.report_id} />}
              </div>
            )}
          </div>
        </div>
      ))}

      {liveInvestigationId ? (
        <div className="flex justify-start">
          <div className="max-w-2xl">
            <InvestigationTrail
              investigationId={liveInvestigationId}
              live
              onTerminal={onLiveTerminal}
              startedAt={requestStartedAt}
            />
          </div>
        </div>
      ) : (
        pendingMessage && (
          <div className="flex justify-start">
            <div className="max-w-2xl">
              <ul className="mt-2 space-y-1.5">
                <li className="flex items-start gap-2 text-xs text-muted">
                  <span className="mt-1 size-3 shrink-0 animate-pulse rounded-full bg-accent"/>
                  <ElapsedTimer startedAt={requestStartedAt} className="ml-auto shrink-0 text-[11px] tabular-nums text-muted" />
                </li>
              </ul>
            </div>
          </div>
        )
      )}
    </div>
  );
}

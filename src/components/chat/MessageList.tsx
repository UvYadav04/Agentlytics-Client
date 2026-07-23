"use client";

import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useGetChartQuery, useGetMessagesQuery, useGetReportQuery } from "@/lib/api/apiSlice";
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
  // Optimistic echo of the user's own message, shown the instant it's sent
  // rather than waiting on the round trip - see handleSend in
  // app/chat/page.tsx.
  pendingMessage: string | null;
  // Date.now() from the moment pendingMessage was set - drives the "12s"
  // elapsed readout below and inside InvestigationTrail. Null when no
  // request is in flight.
  requestStartedAt: number | null;
  onLiveTerminal: () => void;
}) {
  const { data: messages = [] } = useGetMessagesQuery(chatId);

  // handleSend (app/chat/page.tsx) sets pendingMessage immediately, then
  // later dispatches a forceRefetch of getMessages and only clears
  // pendingMessage once that resolves. Those are two separate state
  // updates, so there's a render in between where `messages` already
  // contains the real (server-confirmed) user message AND pendingMessage
  // is still set - without this check that renders a duplicate bubble for
  // one frame (the "added, removed, added again" flicker). Deriving
  // showPendingBubble instead of relying on timing means the duplicate
  // simply never renders, regardless of exactly when each state update
  // lands.
  const lastMessage = messages[messages.length - 1];
  const pendingAlreadyLanded =
    !!pendingMessage && lastMessage?.role === "user" && lastMessage.content === pendingMessage;
  const showPendingBubble = !!pendingMessage && !pendingAlreadyLanded;

  if (messages.length === 0 && !liveInvestigationId && !pendingMessage) {
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
      {messages.map((m) => (
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

      {showPendingBubble && (
        <div className="flex justify-end">
          <div className="max-w-2xl">
            <p className="rounded-card border border-border px-4 py-2.5 text-base whitespace-pre-wrap opacity-70">
              {pendingMessage}
            </p>
          </div>
        </div>
      )}

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
          // The mutation hasn't resolved with an investigation_id yet, so
          // InvestigationTrail (which needs one to open its SSE stream)
          // can't mount - this keeps the left-side spinner unbroken from
          // the moment the message is sent through to when it takes over.
          <div className="flex justify-start">
            <div className="max-w-2xl">
              <ul className="mt-2 space-y-1.5">
                <li className="flex items-start gap-2 text-xs text-muted">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-accent" />
                  <span>Starting investigation...</span>
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

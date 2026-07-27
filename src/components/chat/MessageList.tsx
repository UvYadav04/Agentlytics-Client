"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FileText } from "lucide-react";
import { useGetChartQuery, useGetFilesQuery, useGetMessagesQuery, useGetReportQuery } from "@/lib/api/apiSlice";
import type { ChatMessage } from "@/lib/types";
import ElapsedTimer from "./ElapsedTimer";
import InvestigationTrail from "./InvestigationTrail";
import MarkdownTable from "./MarkdownTable";

const MARKDOWN_COMPONENTS = { table: MarkdownTable };

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

// "These files were used for this" - a quiet, non-clickable readout of which workspace files
// this specific answer was actually based on (Message.files_used, straight off
// OrchestratorResult.files_used server-side - see FinalResultCollector). Resolves filenames
// against the same getFiles cache FilesPanel/InputBar already populate for this workspace, so
// this never costs an extra request.
function FilesUsedRow({ workspaceId, fileIds }: { workspaceId: string; fileIds: string[] }) {
  const { data: files = [] } = useGetFilesQuery(workspaceId);
  if (fileIds.length === 0) return null;

  return (
    <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-muted">
      <FileText className="h-3 w-3 shrink-0" />
      <span>Used:</span>
      {fileIds.map((id) => {
        const file = files.find((f) => f.id === id);
        return (
          <span
            key={id}
            className="rounded-full border border-border bg-bg px-2 py-0.5 font-medium text-text"
          >
            {file?.filename || id}
          </span>
        );
      })}
    </div>
  );
}

export default function MessageList({
  chatId,
  workspaceId,
  liveInvestigationId,
  pendingMessage,
  requestStartedAt,
  onLiveTerminal,
}: {
  chatId: string;
  workspaceId: string | null;
  liveInvestigationId: string | null;
  pendingMessage: string | null;
  requestStartedAt: number | null;
  onLiveTerminal: () => void;
}) {
  const { data: messages = [] } = useGetMessagesQuery(chatId);

  const [displayMessages, setDisplayMessages] = useState<ChatMessage[]>(messages);

  // Scroll container + the content wrapper inside it. Kept separate so a
  // ResizeObserver can watch the *content* grow (new messages, or the live
  // investigation trail streaming in) without a plain overflow container
  // ever reporting a size change of its own.
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  // Whether we should keep pinning to the bottom as content grows - turned
  // off the moment the user scrolls up to read something earlier, so a
  // streaming answer doesn't yank them back down.
  const stickToBottomRef = useRef(true);

  function scrollToBottom() {
    const el = outerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    function onScroll() {
      if (!el) return;
      const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      stickToBottomRef.current = distanceFromBottom < 64;
    }
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // Opening or switching chats should land directly on the last message -
  // no smooth-scroll animation, it should just already be in view.
  useLayoutEffect(() => {
    stickToBottomRef.current = true;
    scrollToBottom();
  }, [chatId]);

  useLayoutEffect(() => {
    if (stickToBottomRef.current) scrollToBottom();
  });

  useEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;
    const observer = new ResizeObserver(() => {
      if (stickToBottomRef.current) scrollToBottom();
    });
    observer.observe(inner);
    return () => observer.disconnect();
  }, []);

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
        files_used: [],
        created_at: new Date().toISOString(),
      },
    ]);
  }, [messages, pendingMessage, chatId]);

  // Normally the parent page swaps this whole component out for
  // EmptyChatComposer while there are zero messages - this is just a
  // defensive fallback (e.g. mid-refetch) so it never renders a blank pane.
  if (displayMessages.length === 0 && !liveInvestigationId && !pendingMessage) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-center text-muted px-6">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-accent/20 bg-accent-soft">
          <span className="h-3 w-3 rounded-full bg-accent" />
        </div>
        <p className="text-sm max-w-sm">
          Upload a file, then ask it something real.
        </p>
      </div>
    );
  }

  return (
    <div ref={outerRef} className="flex-1 overflow-y-auto bg-bg px-6 py-6">
      <div ref={innerRef} className="space-y-5">
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
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={MARKDOWN_COMPONENTS}>
                  {m.content}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="rounded-card border border-border px-4 py-2.5 text-base whitespace-pre-wrap">
                {m.content}
              </p>
            )}

            {m.role === "assistant" && workspaceId && m.files_used.length > 0 && (
              <FilesUsedRow workspaceId={workspaceId} fileIds={m.files_used} />
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
    </div>
  );
}

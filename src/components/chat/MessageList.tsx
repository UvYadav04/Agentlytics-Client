"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FileText } from "lucide-react";
import { useGetChartQuery, useGetFilesQuery, useGetReportQuery } from "@/lib/api/apiSlice";
import type { ChatMessage } from "@/lib/types";
import AutoHeightIframe from "@/components/AutoHeightIframe";
import ElapsedTimer from "./ElapsedTimer";
import InvestigationTrail from "./InvestigationTrail";
import MarkdownTable from "./MarkdownTable";
import type { Components } from "react-markdown";

const MARKDOWN_COMPONENTS: Components = { table: MarkdownTable };

// Inline, interactive chart preview - same sandboxed AutoHeightIframe the standalone /chart/[id]
// page uses (chart.url is a presigned link straight to the generated, self-contained HTML file -
// see reporting_tools.py/tabular_tools.py server-side), just rendered right in the message bubble
// instead of behind a click. "Open full view" still deep-links to the standalone page for a
// bigger canvas / sharing a direct link.
function ChartPreview({ chartId }: { chartId: string }) {
  const { data: chart, isError } = useGetChartQuery(chartId);

  if (isError) {
    return (
      <div className="rounded-card border border-border bg-bg px-3 py-2 text-xs text-rust">
        Failed to load chart
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-card border border-border bg-card shadow-card">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <span className="flex items-center gap-1.5 truncate text-xs font-medium text-text">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
          <span className="truncate">{chart?.title || "Loading chart..."}</span>
        </span>
        {chart && (
          <Link
            href={`/chart/${chartId}`}
            className="shrink-0 text-[11px] font-medium text-muted transition-colors hover:text-accent-dark"
          >
            Open full view &#8599;
          </Link>
        )}
      </div>
      {chart ? (
        // Never injected into our DOM - a sandboxed iframe loads the generated HTML straight
        // from its own presigned URL, so the chart's own hover/zoom/tooltip JS keeps working
        // exactly as it does on the full-page view.
        <AutoHeightIframe src={chart.url} title={chart.title} className="w-full" />
      ) : (
        <div className="h-48 w-full animate-pulse bg-border/30" />
      )}
    </div>
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

// Clickable suggested-next-question chips (see shared/models/message.py's
// Message.follow_up_questions / analyzerEngine/tools/orchestrator/follow_up.py). Clicking one
// sends it exactly like typing it into the composer and hitting send.
function FollowUpChips({
  questions,
  onSend,
}: {
  questions: string[];
  onSend: (content: string, fileIds: string[]) => void;
}) {
  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {questions.map((q) => (
        <button
          key={q}
          type="button"
          onClick={() => onSend(q, [])}
          className="rounded-full border border-border bg-bg px-3 py-1.5 text-xs font-medium text-text transition-colors hover:border-accent hover:bg-accent-soft/50 hover:text-accent-dark"
        >
          {q}
        </button>
      ))}
    </div>
  );
}

export default function MessageList({
  chatId,
  workspaceId,
  messages,
  liveInvestigationId,
  sending,
  requestStartedAt,
  onLiveTerminal,
  onSend,
}: {
  chatId: string;
  workspaceId: string | null;
  messages: ChatMessage[];
  liveInvestigationId: string | null;
  sending: boolean;
  requestStartedAt: number | null;
  onLiveTerminal: () => void;
  // Same handler InputBar's composer uses (chat/page.tsx's handleSend) - wired up here too so
  // clicking a follow-up suggestion sends it exactly like typing it and hitting send.
  onSend: (content: string, fileIds: string[]) => void;
}) {
  const busy = sending || !!liveInvestigationId;
  // messages is owned by the parent page (currentMessages) - hydrated from the server only on
  // chat load/switch, appended to directly on send and on assistant completion. Nothing in this
  // component re-fetches or re-syncs it.

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

  // Sending a message re-pins to the bottom even if the user had scrolled up to read earlier
  // history - `sending` flips true for the brief window between hitting send and the request
  // resolving (see chat/page.tsx's handleSend), which is exactly "the user just sent a message".
  // Once pinned, the ResizeObserver below keeps it stuck to the bottom as the live investigation
  // trail streams in and the final answer is appended, same as any other content-growth case -
  // this effect only needs to handle the initial jump.
  useLayoutEffect(() => {
    if (sending) {
      stickToBottomRef.current = true;
      scrollToBottom();
    }
  }, [sending]);

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

  // Normally the parent page swaps this whole component out for
  // EmptyChatComposer while there are zero messages - this is just a
  // defensive fallback (e.g. mid-refetch) so it never renders a blank pane.
  if (messages.length === 0 && !liveInvestigationId && !sending) {
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
      {messages.map((m, idx) => (
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

            {m.chart_ids.length > 0 && (
              <div className="mt-3 space-y-2">
                {m.chart_ids.map((id) => (
                  <ChartPreview key={id} chartId={id} />
                ))}
              </div>
            )}

            {m.report_id && (
              <div
                className={`mt-3 flex flex-wrap gap-2 ${
                  m.role === "user" ? "justify-end" : ""
                }`}
              >
                <ReportThumb reportId={m.report_id} />
              </div>
            )}

            {/* Only the most recent assistant turn, and only once nothing is actively running -
                a follow-up suggestion from three messages ago is more likely to confuse than
                help, and clicking one mid-stream would fire a second send on top of the first. */}
            {m.role === "assistant" &&
              idx === messages.length - 1 &&
              !busy &&
              m.follow_up_questions?.length > 0 && (
                <FollowUpChips questions={m.follow_up_questions} onSend={onSend} />
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
        sending && (
          <div className="flex justify-start">
            <div className="max-w-2xl">
              <ul className="mt-2 space-y-1.5">
                <li className="flex items-start gap-2 text-xs text-muted">
                  <span className="mt-1 size-3 shrink-0 animate-pulse rounded-full bg-accent"/>
                  {/* <ElapsedTimer startedAt={requestStartedAt} className="ml-auto shrink-0 text-[11px] tabular-nums text-muted" /> */}
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

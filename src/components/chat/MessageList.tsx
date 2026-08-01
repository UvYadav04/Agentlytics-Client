"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FileText, FileSpreadsheet } from "lucide-react";
import { useGetChartQuery, useGetFilesQuery, useGetReportQuery } from "@/lib/api/apiSlice";
import type { ChatMessage } from "@/lib/types";
import AutoHeightIframe from "@/components/AutoHeightIframe";
import ElapsedTimer from "./ElapsedTimer";
import InvestigationTrail from "./InvestigationTrail";
import MarkdownTable from "./MarkdownTable";
import type { Components } from "react-markdown";

const MARKDOWN_COMPONENTS: Components = { table: MarkdownTable };

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

function CsvFileChip({ reportId }: { reportId: string }) {
  const { data: report } = useGetReportQuery(reportId);
  return (
    <Link
      href={`/report/${reportId}`}
      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-bg px-3 py-1.5 text-xs font-medium transition-colors hover:border-teal hover:bg-teal/10 hover:text-teal"
    >
      <FileSpreadsheet className="h-3.5 w-3.5 shrink-0" />
      {report?.title || "Loading..."}
    </Link>
  );
}

function CsvFilesRow({ csvFileIds }: { csvFileIds: string[] }) {
  if (csvFileIds.length === 0) return null;

  return (
    <div className="mt-3 space-y-1.5">
      <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted">
        <FileSpreadsheet className="h-3 w-3" />
        <span>CSV Files</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {csvFileIds.map((id) => (
          <CsvFileChip key={id} reportId={id} />
        ))}
      </div>
    </div>
  );
}

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

  onSend: (content: string, fileIds: string[]) => void;
}) {
  const busy = sending || !!liveInvestigationId;

  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
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

  useLayoutEffect(() => {
    stickToBottomRef.current = true;
    scrollToBottom();
  }, [chatId]);

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

            {m.csv_file_ids.length > 0 && <CsvFilesRow csvFileIds={m.csv_file_ids} />}

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

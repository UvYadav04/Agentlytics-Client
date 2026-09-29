"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Loader2, MessageCircleQuestion, X } from "lucide-react";
import { useInvestigationStream } from "@/lib/useInvestigationStream";
import { findPendingQuestion, toPendingQuestion } from "@/lib/questions";
import type { InvestigationEvent, PendingQuestion } from "@/lib/types";
import ElapsedTimer from "./ElapsedTimer";

const TYPE_COLOR: Record<string, string> = {
  tool_call: "bg-accent",
  tool_result: "bg-clay",
  tool_error: "bg-rust",
  status: "bg-gold",
  answer: "bg-plum",
  completed: "bg-accent-dark",
  cancelled: "bg-muted",
  error: "bg-rust",
};


interface rowEvent { kind: "pair"; key: string; message: string; status: "pending" | "success" | "error" ,parents:number}
interface event { kind: "plain"; key: string; message: string; type: string };
interface questionEvent {
  kind: "question";
  key: string;
  question: PendingQuestion;
  status: "pending" | "answered" | "expired";
  answer: string | null;
}
type Row =
  | event
  | rowEvent
  | questionEvent

function buildRows(steps: InvestigationEvent[]): Row[] {
  const rows: Row[] = [];
  const stack: number[] = [];
  const questionRows = new Map<string, number>();

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];

    if (step.type === "question") {
      const question = toPendingQuestion(step);
      if (question) {
        rows.push({ kind: "question", key: `${i}`, question, status: "pending", answer: null });
        questionRows.set(question.question_id, rows.length - 1);
      }
      continue;
    }

    if (step.type === "question_answered" || step.type === "question_expired") {
      const questionId = step.data?.question_id;
      const rowIndex = typeof questionId === "string" ? questionRows.get(questionId) : undefined;
      if (rowIndex !== undefined) {
        const row = rows[rowIndex] as questionEvent;
        row.status = step.type === "question_answered" ? "answered" : "expired";
        row.answer = step.type === "question_answered" ? step.message : null;
      }
      continue;
    }

    if (step.type === "tool_call") {
      rows.push({
        kind: "pair",
        key: `${i}`,
        message: step.message,
        status: "pending",
        parents:stack.length
      });

      stack.push(rows.length - 1);
      continue;
    }

    if (step.type === "tool_result") {
      const rowIndex = stack.pop();

      if (rowIndex !== undefined) {
        (rows[rowIndex] as rowEvent).status = "success";
      }

      continue;
    }

    if (step.type === "tool_error") {
      const rowIndex = stack.pop();

      if (rowIndex !== undefined) {
        (rows[rowIndex] as rowEvent).status = "error";
      }

      continue;
    }

    rows.push({
      kind: "plain",
      key: `${i}`,
      message: step.message,
      type: step.type,
    });
  }

  return rows;
}

function QuestionCard({
  row,
  canAnswer,
  onAnswer,
}: {
  row: questionEvent;
  canAnswer: boolean;
  onAnswer?: (answer: string, questionId: string) => Promise<void> | void;
}) {
  const [submitting, setSubmitting] = useState<string | null>(null);
  const pending = row.status === "pending";
  const interactive = pending && canAnswer && !!onAnswer;

  async function choose(option: string) {
    if (!onAnswer || submitting) return;
    setSubmitting(option);
    try {
      await onAnswer(option, row.question.question_id);
    } catch {
      setSubmitting(null);
    }
  }

  return (
    <li className="rounded-card border border-accent/30 bg-accent-soft/40 px-3 py-2.5">
      <div className="flex items-start gap-2 text-sm text-text">
        <MessageCircleQuestion className="mt-0.5 size-4 shrink-0 text-accent-dark" />
        <span className="whitespace-pre-line">{row.question.question}</span>
      </div>

      {interactive && row.question.options.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5 pl-6">
          {row.question.options.map((option) => (
            <button
              key={option}
              type="button"
              disabled={!!submitting}
              onClick={() => choose(option)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed ${
                submitting === option
                  ? "border-accent bg-accent-soft text-accent-dark"
                  : "border-border bg-bg text-text hover:border-accent hover:bg-accent-soft/50 hover:text-accent-dark disabled:opacity-50"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}

      {interactive && (
        <p className="mt-2 pl-6 text-[11px] text-muted">
          {row.question.options.length > 0
            ? "Pick an option or type your own answer below."
            : "Type your answer below."}
        </p>
      )}

      {row.status === "answered" && (
        <p className="mt-1.5 flex items-center gap-1 pl-6 text-xs text-muted">
          <Check className="size-3 shrink-0 text-accent-dark" />
          <span>
            You answered: <span className="font-medium text-text">{row.answer}</span>
          </span>
        </p>
      )}

      {row.status === "expired" && (
        <p className="mt-1.5 pl-6 text-xs text-muted">
          No answer received - continued with the most reasonable assumption.
        </p>
      )}
    </li>
  );
}

export default function InvestigationTrail({
  investigationId,
  live,
  onTerminal,
  startedAt = null,
  onAnswer,
  onPendingQuestionChange,
}: {
  investigationId: string;
  live: boolean;
  onTerminal?: () => void;
  startedAt?: number | null;
  onAnswer?: (answer: string, questionId: string) => Promise<void> | void;
  onPendingQuestionChange?: (question: PendingQuestion | null) => void;
}) {
  const events = useInvestigationStream(investigationId, () => {
    onTerminal?.();
  });
  const steps = events.filter((e) => e.type !== "answer" && e.type !== "completed");
  const rows = buildRows(steps);

  const pendingQuestion = useMemo(() => (live ? findPendingQuestion(events) : null), [events, live]);
  const pendingQuestionId = pendingQuestion?.question_id ?? null;

  useEffect(() => {
    onPendingQuestionChange?.(pendingQuestion);
  }, [pendingQuestionId]);

  useEffect(() => {
    return () => onPendingQuestionChange?.(null);
  }, []);

  return (
    <ul className="mt-2 space-y-1.5 ">
      {live && <li className="flex place-content-start place-items-center  gap-1 text-xs text-muted">
        <span
          className={`size-[7px] shrink-0 rounded-full bg-accent ${live && steps.length === 0 ? "animate-pulse" : ""
            }`}
        />
        <span className="mb-[2px]">connecting with analyzer{live && steps.length === 0 ? "..." : ""}</span>
      </li>}
      {rows.length > 0 && rows.map((row) =>
      {
        if (row.kind === "question") {
          return (
            <QuestionCard
              key={row.key}
              row={row}
              canAnswer={live && row.question.question_id === pendingQuestionId}
              onAnswer={onAnswer}
            />
          );
        }

        return row.kind === "pair" ? (
          <li key={row.key} className="flex items-center gap-1.5 text-xs text-muted">
            <span
              style={{ marginInlineStart: (row as rowEvent).parents * 20 }}
              className={`size-[7px] shrink-0 rounded-full ${(row as rowEvent).status === "pending"
                ? "animate-pulse bg-accent"
                : row.status === "success"
                  ? "bg-accent-dark"
                  : "bg-rust"
                }`}
            />

            <span className="mb-[2px] min-w-0 flex-1 whitespace-pre-line">{row.message}</span>
            {row.status === "error" && (
              <X className="size-3 shrink-0 text-rust" aria-label="Failed" />
            )}
            {row.status === "pending" && (
              <Loader2 className="size-3 shrink-0 animate-spin text-muted" aria-label="Running" />
            )}
            {row.status === "success" && (
              <Check className="size-3 shrink-0 text-accent-dark" aria-label="Done" />
            )}
          </li>
        ) : (
          <li key={row.key} className="flex place-content-start gap-1 text-xs text-muted">
            <span
              className={`mt-[3px] size-[7px] shrink-0 rounded-full ${TYPE_COLOR[row.type] || "bg-border"}`}
            />
            <span className="mb-[2px] whitespace-pre-line">{row.message}</span>
          </li>
        )
      }
        )}
    </ul>
  );
}

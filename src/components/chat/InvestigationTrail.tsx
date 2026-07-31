"use client";

import { Check, Loader2, X } from "lucide-react";
import { useInvestigationStream } from "@/lib/useInvestigationStream";
import type { InvestigationEvent } from "@/lib/types";
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

// A tool_call is always followed by exactly one tool_result or tool_error for the same call (see
// analyzerEngine/agents/events.py's make_tool_event_translator) - merge each such pair into ONE
// row instead of two: the step's label stays put, a spinner sits at the right while waiting for
// the matching result, then swaps to a check (tool_result) or cross (tool_error) once it lands.
// Anything else (status/cancelled/error, or a tool_call still awaiting its result at the tail of
// the stream) renders as its own plain row with the usual colored dot.

interface rowEvent { kind: "pair"; key: string; message: string; status: "pending" | "success" | "error" ,parents:number}
interface event { kind: "plain"; key: string; message: string; type: string };
type Row =
  | event
  | rowEvent

function buildRows(steps: InvestigationEvent[]): Row[] {
  const rows: Row[] = [];
  const stack: number[] = [];
  let depth = 0;

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];

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

    rows.push({
      kind: "plain",
      key: `${i}`,
      message: step.message,
      type: step.type,
    });
  }

  return rows;
}

export default function InvestigationTrail({
  investigationId,
  live,
  onTerminal,
  startedAt = null,
}: {
  investigationId: string;
  live: boolean;
  onTerminal?: () => void;
  // Date.now() from when the user's message was sent - see chat/page.tsx's
  // requestStartedAt. Only meaningful (and only rendered) while `live`; a
  // historical trail (live=false) has no "time elapsed" to show.
  startedAt?: number | null;
}) {
  const events = useInvestigationStream(investigationId, () => {
    onTerminal?.();
  });
  const steps = events.filter((e) => e.type !== "answer" && e.type !== "completed");
  const rows = buildRows(steps);

  let pendings = 0;
  return (
    <ul className="mt-2 space-y-1.5 ">
      <li className="flex place-content-start place-items-center  gap-1 text-xs text-muted">
        <span
          className={`size-[7px] shrink-0 rounded-full bg-accent ${live && steps.length === 0 ? "animate-pulse" : ""
            }`}
        />
        <span className="mb-[2px]">connecting with analyzer{live && steps.length === 0 ? "..." : ""}</span>
      </li>
      {rows.length > 0 && rows.map((row, index) =>
      {
        
        return row.kind === "pair" ? (
          <li key={row.key} className="flex items-center gap-1.5 text-xs text-muted">
            <span
              className={`size-[7px] shrink-0 rounded-full ms-${(row as rowEvent).parents * 5} ${(row as rowEvent).status === "pending"
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

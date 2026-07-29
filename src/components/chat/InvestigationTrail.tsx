"use client";

import { useInvestigationStream } from "@/lib/useInvestigationStream";
import ElapsedTimer from "./ElapsedTimer";

const TYPE_COLOR: Record<string, string> = {
  tool_call: "bg-accent",
  tool_result: "bg-clay",
  status: "bg-gold",
  answer: "bg-plum",
  completed: "bg-accent-dark",
  cancelled: "bg-muted",
  error: "bg-rust",
};

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

  if (!live)
    return null

  return (
    <ul className="mt-2 space-y-1.5 ">
      {/* {live &&
        <li className="flex place-content-start place-items-center  gap-1 text-xs text-muted">
           <h3 className="shrink-0 text-[11px] tabular-nums text-muted">working for </h3><ElapsedTimer startedAt={startedAt} className="shrink-0 text-[11px] tabular-nums text-muted" />
          </li> 
} */}

      <li className="flex place-content-start place-items-center  gap-1 text-xs text-muted">
        <span
          className={`size-[7px] shrink-0 rounded-full bg-accent ${live && steps.length === 0 ? "animate-pulse" : ""
            }`}
        />
        <span className="mb-[2px]">connecting with analyzer{live && steps.length === 0 ? "..." : ""}</span>
      </li>
      {steps.map((e, i) => (
        <li key={i} className="flex place-content-start place-items-center  gap-1 text-xs text-muted">
          <span
            className={` size-[7px] shrink-0 rounded-full ${TYPE_COLOR[e.type] || "bg-border"}`}
          />
          <span className="mb-[2px]">{e.message}</span>
        </li>
      ))}
    </ul>
  );
}

"use client";

import { useInvestigationStream } from "@/lib/useInvestigationStream";

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
}: {
  investigationId: string;
  live: boolean;
  onTerminal?: () => void;
}) {
  const events = useInvestigationStream(investigationId, () => {
    onTerminal?.();
  });
  const steps = events.filter((e) => e.type !== "answer" && e.type !== "completed");

  return (
    <ul className="mt-2 space-y-1.5">
      <li className="flex items-start gap-2 text-xs text-muted">
        <span
          className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent ${
            live && steps.length === 0 ? "animate-pulse" : ""
          }`}
        />
        <span>Connecting with analyzer{live && steps.length === 0 ? "..." : ""}</span>
      </li>
      {steps.map((e, i) => (
        <li key={i} className="flex items-start gap-2 text-xs text-muted">
          <span
            className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${TYPE_COLOR[e.type] || "bg-border"}`}
          />
          <span>{e.message}</span>
        </li>
      ))}
    </ul>
  );
}

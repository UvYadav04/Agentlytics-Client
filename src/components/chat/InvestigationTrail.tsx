"use client";

import { useState } from "react";
import { useInvestigationStream } from "@/lib/useInvestigationStream";

const TYPE_COLOR: Record<string, string> = {
  tool_call: "bg-accent",
  tool_result: "bg-teal",
  status: "bg-gold",
  answer: "bg-plum",
  completed: "bg-teal",
  cancelled: "bg-muted",
  error: "bg-rust",
};

export default function InvestigationTrail({
  investigationId,
  live,
  onTerminal,
  autoOpen = false,
}: {
  investigationId: string;
  live: boolean;
  onTerminal?: () => void;
  autoOpen?: boolean;
}) {
  const [open, setOpen] = useState(autoOpen);
  const events = useInvestigationStream(open ? investigationId : null, () => {
    onTerminal?.();
  });

  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-xs text-muted hover:text-accent-dark"
      >
        {open ? "Hide" : "Show"} how I got this{live ? " (live)" : ""}
      </button>
      {open && (
        <ul className="mt-2 space-y-1.5 border-l-2 border-border pl-3">
          {events.length === 0 && (
            <li className="text-xs text-muted">Waiting for activity...</li>
          )}
          {events
            .filter((e) => e.type !== "answer")
            .map((e, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-muted">
                <span
                  className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${TYPE_COLOR[e.type] || "bg-border"}`}
                />
                <span>{e.message}</span>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
